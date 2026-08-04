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
  WhiteboardElement,
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
  WhiteboardPanel,
  UsersPanel,
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
  const { settings, updateSettings, appTheme, toggleAppTheme } = useSettingsStore();
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [mutedUserSockets, setMutedUserSockets] = useState<string[]>([]);

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
    let initTimer: ReturnType<typeof setTimeout> | null = null;

    const updateFilesList = () => {
      const raw = filesArray.toArray();
      // Deduplicate — CRDT + IndexedDB restore can cause repeats
      const unique = [...new Set(raw)];

      // If duplicates exist in the CRDT array, clean them up
      if (unique.length !== raw.length) {
        doc.transact(() => {
          filesArray.delete(0, filesArray.length);
          filesArray.push(unique);
        });
        return; // observer will fire again with clean data
      }

      if (unique.length === 0) {
        // Don't insert default immediately — IndexedDB may still be loading.
        // Wait a short tick, then check again.
        if (initTimer) clearTimeout(initTimer);
        initTimer = setTimeout(() => {
          if (filesArray.length === 0) {
            doc.transact(() => {
              filesArray.push(['main.js']);
            });
          }
        }, 300);
      } else {
        setFileList(unique);
        if (initTimer) clearTimeout(initTimer);
      }
    };

    updateFilesList();
    filesArray.observe(updateFilesList);

    return () => {
      filesArray.unobserve(updateFilesList);
      if (initTimer) clearTimeout(initTimer);
    };
  }, [doc]);

  const [whiteboardElements, setWhiteboardElements] = useState<WhiteboardElement[]>([]);

  useEffect(() => {
    const wbArray = doc.getArray<WhiteboardElement>('whiteboardElements');
    const updateWb = () => {
      setWhiteboardElements(wbArray.toArray());
    };
    updateWb();
    wbArray.observe(updateWb);
    return () => {
      wbArray.unobserve(updateWb);
    };
  }, [doc]);

  const handleAddWhiteboardElement = (el: WhiteboardElement) => {
    const wbArray = doc.getArray<WhiteboardElement>('whiteboardElements');
    doc.transact(() => {
      wbArray.push([el]);
    });
  };

  const handleClearWhiteboard = () => {
    const wbArray = doc.getArray<WhiteboardElement>('whiteboardElements');
    doc.transact(() => {
      wbArray.delete(0, wbArray.length);
    });
  };

  const activeRecordingIdRef = useRef<string | null>(null);

  const recordEvent = async (type: 'code' | 'chat' | 'presence', author: string, detail: string) => {
    if (!activeRecordingIdRef.current) return;
    try {
      const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${apiHost}/api/recordings/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordingId: activeRecordingIdRef.current,
          type,
          author,
          detail,
        }),
      });
    } catch (err) {
      // Ignore background recording event errors
    }
  };

  useEffect(() => {
    if (!username) return;

    const init = async () => {
      socketRef.current = await initSocket();

      const socket = socketRef.current;
      socket.off('connect_error');
      socket.off('connect_failed');
      socket.off(SocketActions.JOINED);
      socket.off(SocketActions.DISCONNECTED);
      socket.off(SocketActions.CHAT_HISTORY);
      socket.off(SocketActions.CHAT_BROADCAST);

      socket.off(SocketActions.CHAT_BROADCAST);
      socket.off(SocketActions.RECORDING_NOTIFY);
      socket.off(SocketActions.USER_MUTE);
      socket.off(SocketActions.USER_KICK);

      socket.on('connect_error', (err) => handleErrors(err));
      socket.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e: any) {
        console.error('socket error', e);
        toast.error('Socket connection failed, try again later.');
        navigate('/');
      }

      socket.emit(SocketActions.JOIN, {
        roomId,
        username,
      });

      socket.on(
        SocketActions.JOINED,
        ({ clients: updatedClients, username: joinedUser }: JoinedPayload) => {
          if (joinedUser !== username) {
            toast.success(`${joinedUser} joined the room.`);
          }
          const uniqueClients = updatedClients.filter(
            (c, idx, self) => idx === self.findIndex((item) => item.username === c.username)
          );
          setClients(uniqueClients);
          recordEvent('presence', joinedUser, `${joinedUser} joined room`);
        },
      );

      socket.on(
        SocketActions.DISCONNECTED,
        ({ socketId, username: leftUser }: DisconnectedPayload) => {
          if (leftUser) {
            toast.success(`${leftUser} left the room.`);
          }
          setClients((prev) => prev.filter((client) => client.socketId !== socketId && client.username !== leftUser));
          if (leftUser) {
            recordEvent('presence', leftUser, `${leftUser} left room`);
          }
        },
      );

      socket.on(
        SocketActions.CHAT_HISTORY,
        ({ messages }: ChatHistoryPayload) => {
          setChatMessages(messages);
        },
      );

      socket.on(
        SocketActions.CHAT_BROADCAST,
        (msg: ChatMessage) => {
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          recordEvent('chat', msg.senderName, msg.content);

          // Notify specifically when current user is @mentioned by someone else
          const isMentioned = new RegExp(`@${username}\\b`, 'i').test(msg.content);
          if (msg.senderName !== username && isMentioned) {
            toast(`@${username} You were mentioned by ${msg.senderName}: "${msg.content}"`, {
              icon: '💬',
              duration: 5000,
            });
          }
        },
      );

      socket.on(SocketActions.RECORDING_NOTIFY, (payload: any) => {
        if (payload.action === 'start') {
          toast(`${payload.username} started session recording`, { icon: '🔴' });
        } else {
          toast(`${payload.username} stopped session recording`);
        }
      });

      socket.on(SocketActions.USER_MUTE, (payload: any) => {
        if (payload.mute) {
          setMutedUserSockets((prev) => [...new Set([...prev, payload.targetSocketId])]);
          if (payload.targetSocketId === socket.id) {
            toast.error(`You were muted by ${payload.byUsername}`);
          } else {
            toast(`${payload.targetUsername} was muted by ${payload.byUsername}`);
          }
        } else {
          setMutedUserSockets((prev) => prev.filter((id) => id !== payload.targetSocketId));
          if (payload.targetSocketId === socket.id) {
            toast.success(`You were unmuted by ${payload.byUsername}`);
          }
        }
      });

      socket.on(SocketActions.USER_KICK, (payload: any) => {
        if (payload.targetSocketId === socket.id) {
          toast.error(`You were removed from the room by host ${payload.byUsername}`);
          setTimeout(() => navigate('/'), 1200);
        } else {
          toast(`${payload.targetUsername} was removed by host ${payload.byUsername}`);
          setClients((prev) => prev.filter((c) => c.socketId !== payload.targetSocketId));
        }
      });
    };

    init();

    const handleBeforeUnload = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      if (socketRef.current) {
        socketRef.current.off(SocketActions.JOINED);
        socketRef.current.off(SocketActions.DISCONNECTED);
        socketRef.current.off(SocketActions.CHAT_HISTORY);
        socketRef.current.off(SocketActions.CHAT_BROADCAST);
        socketRef.current.off(SocketActions.RECORDING_NOTIFY);
        socketRef.current.off(SocketActions.USER_MUTE);
        socketRef.current.off(SocketActions.USER_KICK);
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
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiHost}/api/recordings/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: roomId || 'default-room',
        title,
      }),
    });
    const data = await res.json();
    activeRecordingIdRef.current = data.recordingId;

    // Notify all participants in room
    socketRef.current?.emit(SocketActions.RECORDING_NOTIFY, {
      roomId: roomId || 'default-room',
      username,
      action: 'start',
      title,
    });

    return data.recordingId;
  };

  const handleStopRecording = async (recordingId: string): Promise<SessionRecording> => {
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiHost}/api/recordings/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordingId }),
    });
    activeRecordingIdRef.current = null;

    // Notify all participants in room
    socketRef.current?.emit(SocketActions.RECORDING_NOTIFY, {
      roomId: roomId || 'default-room',
      username,
      action: 'stop',
    });

    return await res.json();
  };

  const handleMuteUser = (targetSocketId: string, targetUsername: string, mute: boolean) => {
    socketRef.current?.emit(SocketActions.USER_MUTE, {
      roomId: roomId || 'default-room',
      targetSocketId,
      targetUsername,
      mute,
      byUsername: username,
    });
  };

  const handleKickUser = (targetSocketId: string, targetUsername: string) => {
    socketRef.current?.emit(SocketActions.USER_KICK, {
      roomId: roomId || 'default-room',
      targetSocketId,
      targetUsername,
      byUsername: username,
    });
  };

  const handleFetchRecordings = async (): Promise<SessionRecording[]> => {
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiHost}/api/recordings/room/${roomId || 'default-room'}`);
    const data = await res.json();
    return data.recordings || [];
  };

  const handleDeleteRecording = async (recordingId: string): Promise<void> => {
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    await fetch(`${apiHost}/api/recordings/${recordingId}`, {
      method: 'DELETE',
    });
    toast.success('Session recording deleted');
  };

  const handleAiCompletion = async (
    prompt: string,
    action: 'explain' | 'generate' | 'refactor' | 'fix',
    contextCode?: string,
  ): Promise<AiCompletionResponse> => {
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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

  const handleToggleTheme = () => {
    toggleAppTheme();
    const isNextLight = appTheme === 'dark';
    const nextCodeTheme = isNextLight ? 'githubLight' : 'dracula';
    updateSettings({ theme: nextCodeTheme });
    toast.success(`Switched to ${isNextLight ? 'Light Mode' : 'Dark Mode'}`);
  };

  const handleReplayCodeChange = (newCode: string) => {
    if (activeFile && doc) {
      const yText = doc.getText(`file:${activeFile}`);
      if (yText.toString() !== newCode) {
        doc.transact(() => {
          yText.delete(0, yText.length);
          yText.insert(0, newCode);
        });
      }
    }
  };

  return (
    <div
      data-app-theme={appTheme}
      style={{
        fontFamily: settings.fontFamily,
        fontSize: `${Math.min(16, Math.max(11, settings.fontSize))}px`,
      }}
      className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden transition-colors max-w-full max-h-full"
    >
      {/* Presence Bar */}
      <PresenceBar
        users={presenceUsers}
        currentUsername={username}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Resizable Panes Layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal" id="sync-code-editor-layout-v4" className="h-full w-full">
          {/* File Tree Sidebar Panel */}
          <Panel id="file-tree" defaultSize="20%" minSize="15%" maxSize="35%">
            <FileTree
              files={fileList}
              activeFile={activeFile}
              onSelectFile={setActiveFile}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
              onRenameFile={handleRenameFile}
              onExportZip={handleExportZip}
              onImportZip={handleImportZip}
              onUploadClick={() => fileInputRef.current?.click()}
            />
          </Panel>

          <PanelResizeHandle className="flex-shrink-0 w-1.5 bg-gray-900 border-x border-gray-800/50 hover:bg-indigo-500/40 transition-all cursor-col-resize flex items-center justify-center group focus:outline-none select-none z-20">
            <div className="w-0.5 h-8 bg-gray-700 rounded-full group-hover:bg-indigo-400 transition-colors pointer-events-none" />
          </PanelResizeHandle>

          {/* Main Editor Center Panel */}
          <Panel id="editor" defaultSize="55%" minSize="30%">
            <div className="flex flex-col h-full bg-gray-950">
              {/* File Tab Header */}
              <div className="px-3 py-1.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-gray-400 whitespace-nowrap">Editing:</span>
                  <span className="text-xs font-semibold text-sky-400 font-mono truncate">{activeFile}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <input
                    type="file"
                    accept=".js,.ts,.py,.java,.cpp,.c,.txt,.html,.css,.json,.md"
                    className="hidden"
                    id="fileUpload"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                  <button
                    onClick={copyRoomId}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                  >
                    Copy Room ID
                  </button>
                  <button
                    onClick={leaveRoom}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-semibold rounded-lg border border-red-500/30 transition-colors whitespace-nowrap"
                  >
                    Leave
                  </button>
                </div>
              </div>

              {filePreview && (
                <FilePreview
                  setFilePreview={setFilePreview}
                  fileContent={fileContent}
                  currentCode={codeRef.current}
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
                  fontSize={settings.fontSize}
                  fontFamily={settings.fontFamily}
                  onCodeChange={(code) => {
                    codeRef.current = code;
                    if (activeRecordingIdRef.current) {
                      recordEvent('code', username, code);
                    }
                  }}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="flex-shrink-0 w-1.5 bg-gray-900 border-x border-gray-800/50 hover:bg-indigo-500/40 transition-all cursor-col-resize flex items-center justify-center group focus:outline-none select-none z-20">
            <div className="w-0.5 h-8 bg-gray-700 rounded-full group-hover:bg-indigo-400 transition-colors pointer-events-none" />
          </PanelResizeHandle>

          {/* Right Tools & Customization Panel */}
          <Panel id="tools" defaultSize="25%" minSize="18%" maxSize="45%">
            <ToolsPanel activeTab={activeTab} onSelectTab={handleSelectTab}>
              {activeTab === 'users' && (
                <UsersPanel
                  clients={clients}
                  currentUsername={username}
                  creatorUsername={clients[0]?.username}
                  mutedUserSockets={mutedUserSockets}
                  onMuteUser={handleMuteUser}
                  onKickUser={handleKickUser}
                />
              )}
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
                <WhiteboardPanel
                  elements={whiteboardElements}
                  onAddElement={handleAddWhiteboardElement}
                  onClearElements={handleClearWhiteboard}
                />
              )}
              {activeTab === 'recordings' && (
                <RecordingsPanel
                  roomId={roomId || 'default-room'}
                  currentUsername={username}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                  onFetchRecordings={handleFetchRecordings}
                  onDeleteRecording={handleDeleteRecording}
                  onReplayCodeChange={handleReplayCodeChange}
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
