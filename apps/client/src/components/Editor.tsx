import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { loadLanguage, LanguageName } from '@uiw/codemirror-extensions-langs';
import * as themes from '@uiw/codemirror-themes-all';
import { Socket } from 'socket.io-client';
import { SocketActions, CodeChangePayload } from '@codesync/shared-types';
import { Extension } from '@codemirror/state';

export interface EditorRef {
  setCode: (code: string) => void;
}

interface EditorProps {
  socketRef: React.MutableRefObject<Socket | null>;
  roomId: string;
  language: string;
  theme: string;
  onCodeChange: (code: string) => void;
}

const mapLanguageName = (lang: string): LanguageName => {
  switch (lang) {
    case 'clike':
      return 'cpp' as LanguageName;
    case 'htmlmixed':
      return 'html' as LanguageName;
    case 'js':
      return 'javascript' as LanguageName;
    default:
      return (lang as LanguageName) || ('javascript' as LanguageName);
  }
};

const Editor = forwardRef<EditorRef, EditorProps>(
  ({ socketRef, roomId, language, theme, onCodeChange }, ref) => {
    const [code, setCode] = useState<string>('');

    useImperativeHandle(ref, () => ({
      setCode: (newCode: string) => {
        setCode(newCode);
      },
    }));

    useEffect(() => {
      const socket = socketRef.current;
      if (!socket) return;

      const handleCodeChange = ({ code: incomingCode }: CodeChangePayload) => {
        if (incomingCode !== null && incomingCode !== undefined) {
          setCode(incomingCode);
          onCodeChange(incomingCode);
        }
      };

      socket.on(SocketActions.CODE_CHANGE, handleCodeChange);

      return () => {
        socket.off(SocketActions.CODE_CHANGE, handleCodeChange);
      };
    }, [socketRef.current, onCodeChange]);

    const handleChange = (value: string) => {
      setCode(value);
      onCodeChange(value);

      if (socketRef.current) {
        socketRef.current.emit(SocketActions.CODE_CHANGE, {
          roomId,
          code: value,
        });
      }
    };

    const targetLangName = mapLanguageName(language);
    const langExt = loadLanguage(targetLangName);
    const extensions: Extension[] = langExt ? [langExt] : [];

    const themesMap = themes as unknown as Record<string, Extension>;
    const selectedTheme = themesMap[theme] || themesMap.dracula;

    return (
      <div className="h-full w-full overflow-hidden text-base">
        <CodeMirror
          value={code}
          height="100%"
          theme={selectedTheme}
          extensions={extensions}
          onChange={handleChange}
          className="h-full text-sm"
        />
      </div>
    );
  },
);

Editor.displayName = 'Editor';

export default Editor;
