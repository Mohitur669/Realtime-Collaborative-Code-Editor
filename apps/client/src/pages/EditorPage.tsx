import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import Client from '../components/Client';
import Editor, { EditorRef } from '../components/Editor';
import FilePreview from '../components/FilePreview';
import { SocketActions, ClientInfo, JoinedPayload, DisconnectedPayload } from '@codesync/shared-types';
import { initSocket } from '../socket';
import { Socket } from 'socket.io-client';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'C / C++', value: 'clike' },
  { label: 'Java', value: 'java' },
  { label: 'HTML', value: 'htmlmixed' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'SQL', value: 'sql' },
  { label: 'Rust', value: 'rust' },
  { label: 'Go', value: 'go' },
];

const THEMES = [
  { label: 'oneDark', value: 'oneDark' },
  { label: 'dracula', value: 'dracula' },
  { label: 'nord', value: 'nord' },
  { label: 'githubDark', value: 'githubDark' },
  { label: 'githubLight', value: 'githubLight' },
  { label: 'vscodeDark', value: 'vscodeDark' },
  { label: 'sublime', value: 'sublime' },
];

const EditorPage: React.FC = () => {
  const [lang, setLang] = useState<string>('javascript');
  const [theme, setTheme] = useState<string>('oneDark');
  const [clients, setClients] = useState<ClientInfo[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const codeRef = useRef<string>('');
  const location = useLocation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [filePreview, setFilePreview] = useState<boolean>(false);
  const [fileContent, setFileContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorInstanceRef = useRef<EditorRef | null>(null);

  const username = location.state?.username;

  useEffect(() => {
    if (!username) return;

    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e: any) {
        console.error('socket error', e);
        toast.error('Socket connection failed, try again later.');
        navigate('/');
      }

      socketRef.current.emit(SocketActions.JOIN, {
        roomId,
        username,
      });

      socketRef.current.on(
        SocketActions.JOINED,
        ({ clients: updatedClients, username: joinedUser, socketId }: JoinedPayload) => {
          if (joinedUser !== username) {
            toast.success(`${joinedUser} joined the room.`);
          }
          setClients(updatedClients);

          if (socketRef.current && codeRef.current) {
            socketRef.current.emit(SocketActions.SYNC_CODE, {
              code: codeRef.current,
              socketId,
            });
          }
        },
      );

      socketRef.current.on(
        SocketActions.DISCONNECTED,
        ({ socketId, username: leftUser }: DisconnectedPayload) => {
          if (leftUser) {
            toast.success(`${leftUser} left the room.`);
          }
          setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        },
      );
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.off(SocketActions.JOINED);
        socketRef.current.off(SocketActions.DISCONNECTED);
        socketRef.current.disconnect();
      }
    };
  }, [roomId, username, navigate]);

  if (!username) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      if (roomId) {
        await navigator.clipboard.writeText(roomId);
        toast.success('Room ID copied to clipboard');
      }
    } catch (err) {
      toast.error('Could not copy Room ID');
    }
  };

  const leaveRoom = () => {
    navigate('/');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
        setFilePreview(true);
      };
      reader.readAsText(file);
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateEditorCode = (newCode: string) => {
    editorInstanceRef.current?.setCode(newCode);
    codeRef.current = newCode;
    if (socketRef.current && roomId) {
      socketRef.current.emit(SocketActions.CODE_CHANGE, {
        roomId,
        code: newCode,
      });
    }
  };

  const handleAppendCode = () => {
    const currentCode = codeRef.current || '';
    const appendedCode = currentCode ? `${currentCode}\n\n${fileContent}` : fileContent;
    updateEditorCode(appendedCode);
    setFilePreview(false);
    resetFileInput();
  };

  const handleReplaceCode = () => {
    updateEditorCode(fileContent);
    setFilePreview(false);
    resetFileInput();
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4 justify-between select-none">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-gray-950 text-sm">
              &lt;/&gt;
            </div>
            <h2 className="font-bold tracking-tight text-gray-100 text-lg">Sync Code</h2>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Connected ({clients.length})</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <input
            type="file"
            accept=".js,.ts,.py,.java,.cpp,.c,.txt,.html,.css,.json,.md"
            className="hidden"
            id="fileUpload"
            onChange={handleFileUpload}
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg text-xs border border-gray-700 transition-colors"
          >
            Upload File
          </button>

          {filePreview && (
            <FilePreview
              setFilePreview={setFilePreview}
              fileContent={fileContent}
              resetFileInput={resetFileInput}
              onAppend={handleAppendCode}
              onReplace={handleReplaceCode}
            />
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400">Language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400">Editor Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              {THEMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={copyRoomId}
              className="flex-1 py-2 px-3 bg-green-500 hover:bg-green-400 text-gray-950 font-bold rounded-lg text-xs transition-colors"
            >
              Copy ROOM ID
            </button>
            <button
              onClick={leaveRoom}
              className="py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold rounded-lg text-xs border border-red-500/30 transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-950">
        <Editor
          ref={editorInstanceRef}
          socketRef={socketRef}
          roomId={roomId || ''}
          language={lang}
          theme={theme}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
