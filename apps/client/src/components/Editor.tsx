import React, { useEffect, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { loadLanguage, LanguageName } from '@uiw/codemirror-extensions-langs';
import * as themes from '@uiw/codemirror-themes-all';
import { Extension } from '@codemirror/state';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { yCollab } from 'y-codemirror.next';

export interface EditorRef {
  setCode: (code: string) => void;
}

interface EditorProps {
  doc: Y.Doc;
  provider: HocuspocusProvider;
  activeFilePath: string;
  username: string;
  language: string;
  theme: string;
  fontSize?: number;
  fontFamily?: string;
  onCodeChange?: (code: string) => void;
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

const USER_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#ef4444', '#06b6d4', '#84cc16'
];

const getRandomColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
};

const Editor = forwardRef<EditorRef, EditorProps>(
  ({ doc, provider, activeFilePath, username, language, theme, fontSize = 14, fontFamily = 'monospace', onCodeChange }, ref) => {
    const [crdtExtension, setCrdtExtension] = useState<Extension | null>(null);

    useEffect(() => {
      if (!provider || !provider.awareness) return;

      const userColor = getRandomColor(username || 'Guest');
      provider.awareness.setLocalStateField('user', {
        name: username || 'Guest',
        color: userColor,
        colorLight: userColor + '33',
      });

      const yText = doc.getText(`file:${activeFilePath}`);
      const collab = yCollab(yText, provider.awareness);
      setCrdtExtension(collab);

      const observer = () => {
        if (onCodeChange) {
          onCodeChange(yText.toString());
        }
      };

      yText.observe(observer);

      return () => {
        yText.unobserve(observer);
      };
    }, [doc, provider, activeFilePath, username, onCodeChange]);

    useImperativeHandle(ref, () => ({
      setCode: (newCode: string) => {
        const yText = doc.getText(`file:${activeFilePath}`);
        doc.transact(() => {
          yText.delete(0, yText.length);
          yText.insert(0, newCode);
        });
      },
    }));

    const targetLangName = mapLanguageName(language);
    const langExt = loadLanguage(targetLangName);

    const fontTheme = useMemo(() => {
      return EditorView.theme({
        '&': {
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily || 'monospace',
        },
        '.cm-content': {
          fontFamily: fontFamily || 'monospace',
          fontSize: `${fontSize}px`,
        },
        '.cm-gutters': {
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily || 'monospace',
        },
        '.cm-line': {
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily || 'monospace',
        },
      });
    }, [fontSize, fontFamily]);

    const extensions = useMemo(() => {
      const exts: Extension[] = [fontTheme];
      if (langExt) exts.push(langExt);
      if (crdtExtension) exts.push(crdtExtension);
      return exts;
    }, [langExt, crdtExtension, fontTheme]);

    const themesMap = themes as unknown as Record<string, Extension>;
    const selectedTheme = themesMap[theme] || themesMap.dracula;

    return (
      <div
        className="h-full w-full overflow-hidden"
        style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily || 'monospace' }}
      >
        <CodeMirror
          height="100%"
          theme={selectedTheme}
          extensions={extensions}
          className="h-full"
        />
      </div>
    );
  },
);

Editor.displayName = 'Editor';

export default Editor;
