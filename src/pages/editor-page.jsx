import { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Client from "../components/client";
import Editor from "../components/editor";
import FilePreview from "../components/file-preview";
import Select from "../components/select";
import OutputPanel from "../components/output-panel";
import { language, cmtheme } from "../atoms";
import { useRecoilState } from "recoil";
import ACTIONS from "../actions/actions";
import { initSocket } from "../socket";
import {
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
  RUNNABLE_LANGUAGES,
} from "../constants/editor-options";
import { runJavaScript } from "../lib/run-js";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

const EditorPage = () => {
  const [lang, setLang] = useRecoilState(language);
  const [them, setThem] = useRecoilState(cmtheme);
  const [clients, setClients] = useState([]);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [filePreview, setFilePreview] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [outputLogs, setOutputLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [runDuration, setRunDuration] = useState(null);

  const socketRef = useRef(null);
  const codeRef = useRef("");
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const editorInstanceRef = useRef(null);

  const canRun = RUNNABLE_LANGUAGES.has(lang);

  useEffect(() => {
    if (!location.state?.username) return undefined;

    const nextSocket = initSocket();
    socketRef.current = nextSocket;
    setSocket(nextSocket);
    let redirected = false;

    const handleErrors = (err) => {
      console.error("socket error", err);
      if (redirected) return;
      redirected = true;
      toast.error("Socket connection failed, try again later.");
      navigate("/");
    };

    const onConnect = () => {
      setConnected(true);
      nextSocket.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state.username,
      });
    };

    const onJoined = ({ clients: nextClients, username, socketId }) => {
      if (username !== location.state?.username) {
        toast.success(`${username} joined the room.`);
      }
      setClients(nextClients);
      nextSocket.emit(ACTIONS.SYNC_CODE, {
        code: codeRef.current,
        socketId,
      });
    };

    const onDisconnected = ({ socketId, username }) => {
      toast.success(`${username} left the room.`);
      setClients((prev) =>
        prev.filter((client) => client.socketId !== socketId)
      );
    };

    nextSocket.on("connect", onConnect);
    nextSocket.on("connect_error", handleErrors);
    nextSocket.on(ACTIONS.JOINED, onJoined);
    nextSocket.on(ACTIONS.DISCONNECTED, onDisconnected);

    if (nextSocket.connected) onConnect();

    return () => {
      nextSocket.off("connect", onConnect);
      nextSocket.off("connect_error", handleErrors);
      nextSocket.off(ACTIONS.JOINED, onJoined);
      nextSocket.off(ACTIONS.DISCONNECTED, onDisconnected);
      nextSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [location.state?.username, navigate, roomId]);

  const copyRoomId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }, [roomId]);

  const leaveRoom = useCallback(() => {
    socketRef.current?.disconnect();
    navigate("/");
  }, [navigate]);

  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const updateEditorCode = useCallback(
    (newCode) => {
      editorInstanceRef.current?.setCode(newCode);
      codeRef.current = newCode;
      socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: newCode,
      });
    },
    [roomId]
  );

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(String(e.target.result ?? ""));
      setFilePreview(true);
    };
    reader.readAsText(file);
  };

  const handleAppendCode = () => {
    const currentCode = codeRef.current || "";
    updateEditorCode(
      currentCode ? `${currentCode}\n\n${fileContent}` : fileContent
    );
    setFilePreview(false);
    resetFileInput();
  };

  const handleReplaceCode = () => {
    updateEditorCode(fileContent);
    setFilePreview(false);
    resetFileInput();
  };

  const handleRunCode = () => {
    if (!canRun) {
      toast.error("Run is only available for JavaScript");
      return;
    }

    const code =
      editorInstanceRef.current?.getCode?.() ?? codeRef.current ?? "";

    setRunning(true);
    // Allow UI to paint "Running…" before sync execution
    window.setTimeout(() => {
      const result = runJavaScript(code);
      setOutputLogs(result.logs);
      setRunDuration(result.durationMs);
      setRunning(false);
      if (!result.ok) {
        toast.error(result.error || "Runtime error");
      }
    }, 0);
  };

  if (!location.state?.username) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mainWrap">
      <aside className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/logo.png" alt="Code Sync" />
            <span className="logoText">Code Sync</span>
          </div>

          <div className="sectionTitle">
            <span>Connected</span>
            <span className="badge">{connected ? clients.length : "…"}</span>
          </div>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <div className="separator" />

          <Select
            id="language"
            label="Language"
            value={lang}
            options={LANGUAGE_OPTIONS}
            onChange={(next) => setLang(next)}
          />

          <Select
            id="theme"
            label="Theme"
            value={them}
            options={THEME_OPTIONS}
            onChange={(next) => setThem(next)}
          />
        </div>

        <div className="asideActions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".js,.py,.java,.cpp,.c,.txt,.html,.css,.jsx,.ts,.tsx,.json,.md"
            hidden
            onChange={handleFileUpload}
          />
          {canRun ? (
            <button
              type="button"
              className="btn btn-default btn-block"
              onClick={handleRunCode}
              disabled={running}
            >
              {running ? "Running…" : "Run JS"}
            </button>
          ) : (
            <p className="runHint">Switch to JavaScript to run code</p>
          )}
          <button
            type="button"
            className="btn btn-success btn-block"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload file
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={copyRoomId}
          >
            Copy room ID
          </button>
          <button
            type="button"
            className="btn btn-destructive btn-block"
            onClick={leaveRoom}
          >
            Leave
          </button>
        </div>
      </aside>

      <div className="workspace">
        <div className="editorWrap">
          <Editor
            ref={editorInstanceRef}
            socket={socket}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
        {canRun ? (
          <OutputPanel
            logs={outputLogs}
            running={running}
            durationMs={runDuration}
            onClear={() => {
              setOutputLogs([]);
              setRunDuration(null);
            }}
          />
        ) : null}
      </div>

      {filePreview ? (
        <FilePreview
          setFilePreview={setFilePreview}
          fileContent={fileContent}
          resetFileInput={resetFileInput}
          onAppend={handleAppendCode}
          onReplace={handleReplaceCode}
        />
      ) : null}
    </div>
  );
};

export default EditorPage;
