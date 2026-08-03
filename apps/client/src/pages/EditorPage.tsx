import React, { useState, useRef, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Client from '../components/Client';
import Editor, { EditorRef } from '../components/Editor';
import FilePreview from '../components/FilePreview';
import {
  SocketActions,
  ClientInfo,
  JoinedPayload,
  DisconnectedPayload,
  ChatMessage,
  ChatHistoryPayload,
  LiveKitTokenResponse,
  SessionRecording,
  AiCompletionResponse,
} from '@codesync/shared-types';
import { initSocket } from '../socket';
import { Socket } from 'socket.io-client';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import {
  FileTree,
  PresenceBar,
  ToolsPanel,
  ToolTab,
  EditorSettingsPanel,
  ChatPanel,
  CallPanel,
  RecordingsPanel,
  AiAssistantPanel,
} from '@codesync/ui';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useSettingsStore } from '../store/settingsStore';

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
  const { settings, updateSettings } = useSettingsStore();
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const codeRef = useRef<string>('');
  const location = useLocation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [filePreview, setFilePreview] = useState<boolean>(false);
  const [fileContent, setFileContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorInstanceRef = useRef<EditorRef | null>(null);

  const [activeTab, setActiveTab] = useState<ToolTab>('settings');
  const activeTabRef = useRef<ToolTab>(activeTab);
  activeTabRef.current = activeTab;

  const username = location.state?.username;

  // Yjs Multi-file CRDT workspace initialization
  const { doc, provider } = useMemo(() => {
    const ydoc = new Y.Doc();
    const wsUrl = import.meta.env.VITE_COLLAB_WS_URL || 'ws://localhost:1234';
    const hocusProvider = new HocuspocusProvider({
      url: wsUrl,
      name: roomId || 'default-room',
      document: ydoc,
    });
    new IndexeddbPersistence(roomId || 'default-room', ydoc);
    return { doc: ydoc, provider: hocusProvider };
  }, [roomId]);

  const [fileList, setFileList] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string>('main.js');

  useEffect(() => {
    const filesArray = doc.getArray<string>('projectFiles');

    const updateFilesList = () => {
      const current = filesArray.toArray();
      if (current.length === 0) {
        doc.transact(() => {
          filesArray.push(['main.js']);
        });
        setFileList(['main.js']);
      } else {
        setFileList(current);
      }
    };

    updateFilesList();
    filesArray.observe(updateFilesList);

    return () => {
      filesArray.unobserve(updateFilesList);
    };
  }, [doc]);

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
        ({ clients: updatedClients, username: joinedUser }: JoinedPayload) => {
          if (joinedUser !== username) {
            toast.success(`${joinedUser} joined the room.`);
          }
          setClients(updatedClients);
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

      socketRef.current.on(
        SocketActions.CHAT_HISTORY,
        ({ messages }: ChatHistoryPayload) => {
          setChatMessages(messages);
        },
      );

      socketRef.current.on(
        SocketActions.CHAT_BROADCAST,
        (msg: ChatMessage) => {
          setChatMessages((prev) => [...prev, msg]);
        },
      );
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.off(SocketActions.JOINED);
        socketRef.current.off(SocketActions.DISCONNECTED);
        socketRef.current.off(SocketActions.CHAT_HISTORY);
        socketRef.current.off(SocketActions.CHAT_BROADCAST);
        socketRef.current.disconnect();
      }
      provider.destroy();
    };
  }, [roomId, username, navigate, provider]);

  if (!username) {
    return <Navigate to="/" />;
  }

  const handleSelectTab = (tab: ToolTab) => {
    setActiveTab(tab);
  };

  const handleSendChatMessage = (content: string) => {
    if (socketRef.current) {
      socketRef.current.emit(SocketActions.CHAT_SEND, {
        roomId,
        content,
        senderName: username,
      });
    }
  };

  const handleFetchLiveKitToken = async (): Promise<LiveKitTokenResponse> => {
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiHost}/api/livekit/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: roomId || 'default-room',
        participantName: username,
      }),
    });
    return (await res.json()) as LiveKitTokenResponse;
  };

  const handleStartRecording = async (title?: string): Promise<string> => {
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiHost}/api/recordings/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: roomId || 'default-room',
        title,
      }),
    });
    const data = await res.json();
    return data.recordingId;
  };

  const handleStopRecording = async (recordingId: string): Promise<SessionRecording> => {
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiHost}/api/recordings/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordingId }),
    });
    return await res.json();
  };

  const handleFetchRecordings = async (): Promise<SessionRecording[]> => {
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiHost}/api/recordings/room/${roomId || 'default-room'}`);
    const data = await res.json();
    return data.recordings || [];
  };

  const handleAiCompletion = async (
    prompt: string,
    action: 'explain' | 'generate' | 'refactor' | 'fix',
    contextCode?: string,
  ): Promise<AiCompletionResponse> => {
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiHost}/api/ai/completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, action, contextCode }),
    });
    return await res.json();
  };

  const handleInsertAiCode = (snippet: string) => {
    const current = codeRef.current || '';
    const updated = current ? `${current}\n\n${snippet}` : snippet;
    updateEditorCode(updated);
    toast.success('Inserted AI snippet into editor');
  };

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

  // File tree CRUD operations
  const handleCreateFile = (filePath: string) => {
    const filesArray = doc.getArray<string>('projectFiles');
    if (!filesArray.toArray().includes(filePath)) {
      doc.transact(() => {
        filesArray.push([filePath]);
      });
      setActiveFile(filePath);
      toast.success(`Created file ${filePath}`);
    }
  };

  const handleDeleteFile = (filePath: string) => {
    const filesArray = doc.getArray<string>('projectFiles');
    const current = filesArray.toArray();
    const index = current.indexOf(filePath);
    if (index !== -1 && current.length > 1) {
      doc.transact(() => {
        filesArray.delete(index, 1);
        const yText = doc.getText(`file:${filePath}`);
        yText.delete(0, yText.length);
      });
      const remaining = current.filter((f) => f !== filePath);
      if (activeFile === filePath) {
        setActiveFile(remaining[0]);
      }
      toast.success(`Deleted file ${filePath}`);
    }
  };

  const handleRenameFile = (oldPath: string, newPath: string) => {
    const filesArray = doc.getArray<string>('projectFiles');
    const current = filesArray.toArray();
    const index = current.indexOf(oldPath);
    if (index !== -1 && newPath && !current.includes(newPath)) {
      const oldYText = doc.getText(`file:${oldPath}`);
      const content = oldYText.toString();
      doc.transact(() => {
        filesArray.delete(index, 1);
        filesArray.push([newPath]);
        const newYText = doc.getText(`file:${newPath}`);
        newYText.insert(0, content);
        oldYText.delete(0, oldYText.length);
      });
      if (activeFile === oldPath) {
        setActiveFile(newPath);
      }
    }
  };

  const handleExportZip = async () => {
    const zip = new JSZip();
    fileList.forEach((filePath) => {
      const yText = doc.getText(`file:${filePath}`);
      zip.file(filePath, yText.toString());
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `project-${roomId || 'codesync'}.zip`);
    toast.success('Exported project zip');
  };

  const handleImportZip = async (file: File) => {
    try {
      const zip = await JSZip.loadAsync(file);
      const filesArray = doc.getArray<string>('projectFiles');
      
      const newPaths: string[] = [];
      const entries = Object.entries(zip.files);

      for (const [relativePath, zipEntry] of entries) {
        if (!zipEntry.dir) {
          const content = await zipEntry.async('string');
          newPaths.push(relativePath);
          const yText = doc.getText(`file:${relativePath}`);
          doc.transact(() => {
            yText.delete(0, yText.length);
            yText.insert(0, content);
          });
        }
      }

      doc.transact(() => {
        filesArray.delete(0, filesArray.length);
        filesArray.push(newPaths);
      });

      if (newPaths.length > 0) {
        setActiveFile(newPaths[0]);
      }
      toast.success(`Imported ${newPaths.length} files from zip`);
    } catch (err) {
      toast.error('Failed to import zip');
    }
  };

  const presenceUsers = clients.map((c) => ({
    socketId: c.socketId,
    username: c.username,
    activeFile,
  }));

  const roomUsernames = clients.map((c) => c.username);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Presence Bar */}
      <PresenceBar users={presenceUsers} currentUsername={username} />

      {/* Main Resizable Panes Layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal">
          {/* File Tree Sidebar Panel */}
          <Panel defaultSize={18} minSize={12} maxSize={30}>
            <FileTree
              files={fileList}
              activeFile={activeFile}
              onSelectFile={setActiveFile}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
              onRenameFile={handleRenameFile}
              onExportZip={handleExportZip}
              onImportZip={handleImportZip}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-green-500/50 transition-colors cursor-col-resize" />

          {/* Main Editor Center Panel */}
          <Panel defaultSize={57} minSize={30}>
            <div className="flex flex-col h-full bg-gray-950">
              {/* File Tab Header */}
              <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">Editing:</span>
                  <span className="text-xs font-semibold text-green-400 font-mono">{activeFile}</span>
                </div>
                <div className="flex items-center gap-2">
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
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded border border-gray-700"
                  >
                    Upload File
                  </button>
                  <button
                    onClick={copyRoomId}
                    className="px-2.5 py-1 bg-green-500 hover:bg-green-400 text-gray-950 font-bold rounded text-xs"
                  >
                    Copy Room ID
                  </button>
                  <button
                    onClick={leaveRoom}
                    className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold rounded text-xs border border-red-500/30"
                  >
                    Leave
                  </button>
                </div>
              </div>

              {filePreview && (
                <FilePreview
                  setFilePreview={setFilePreview}
                  fileContent={fileContent}
                  resetFileInput={resetFileInput}
                  onAppend={handleAppendCode}
                  onReplace={handleReplaceCode}
                />
              )}

              <div className="flex-1 overflow-hidden">
                <Editor
                  ref={editorInstanceRef}
                  doc={doc}
                  provider={provider}
                  activeFilePath={activeFile}
                  username={username}
                  language={settings.language}
                  theme={settings.theme}
                  onCodeChange={(code) => {
                    codeRef.current = code;
                  }}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-green-500/50 transition-colors cursor-col-resize" />

          {/* Right Tools & Customization Panel */}
          <Panel defaultSize={25} minSize={18} maxSize={40}>
            <ToolsPanel activeTab={activeTab} onSelectTab={handleSelectTab}>
              {activeTab === 'chat' && (
                <ChatPanel
                  messages={chatMessages}
                  currentUsername={username}
                  onSendMessage={handleSendChatMessage}
                  roomUsers={roomUsernames}
                />
              )}
              {activeTab === 'call' && (
                <CallPanel
                  roomId={roomId || 'default-room'}
                  username={username}
                  onFetchToken={handleFetchLiveKitToken}
                />
              )}
              {activeTab === 'settings' && (
                <EditorSettingsPanel
                  settings={settings}
                  onChangeSettings={updateSettings}
                  languages={LANGUAGES}
                  themes={THEMES}
                />
              )}
              {activeTab === 'ai' && (
                <AiAssistantPanel
                  activeCode={codeRef.current}
                  onCompletion={handleAiCompletion}
                  onInsertCode={handleInsertAiCode}
                />
              )}
              {activeTab === 'whiteboard' && (
                <div className="text-xs text-gray-400 italic">Shared whiteboard coming in Phase 11...</div>
              )}
              {activeTab === 'recordings' && (
                <RecordingsPanel
                  roomId={roomId || 'default-room'}
                  currentUsername={username}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                  onFetchRecordings={handleFetchRecordings}
                />
              )}
            </ToolsPanel>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default EditorPage;
