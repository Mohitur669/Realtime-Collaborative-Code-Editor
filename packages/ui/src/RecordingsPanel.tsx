import React, { useState, useEffect } from 'react';
import { SessionRecording, RecordingEvent } from '@codesync/shared-types';

interface RecordingsPanelProps {
  roomId: string;
  currentUsername: string;
  onStartRecording: (title?: string) => Promise<string>;
  onStopRecording: (recordingId: string) => Promise<SessionRecording>;
  onFetchRecordings: () => Promise<SessionRecording[]>;
  onDeleteRecording?: (recordingId: string) => Promise<void>;
  onReplayCodeChange?: (code: string) => void;
}

const PlayIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export const RecordingsPanel: React.FC<RecordingsPanelProps> = ({
  currentUsername,
  onStartRecording,
  onStopRecording,
  onFetchRecordings,
  onDeleteRecording,
  onReplayCodeChange,
}) => {
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordings, setRecordings] = useState<SessionRecording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<SessionRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [titleInput, setTitleInput] = useState('');

  // Fetch past recordings on mount
  useEffect(() => {
    onFetchRecordings().then((list) => setRecordings(list));
  }, [onFetchRecordings]);

  // Live recording timer ticker
  useEffect(() => {
    let timer: any;
    if (activeRecordingId) {
      timer = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [activeRecordingId]);

  // Playback ticker
  useEffect(() => {
    let timer: any;
    if (isPlaying && selectedRecording) {
      timer = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= selectedRecording.durationSeconds) {
            setIsPlaying(false);
            return selectedRecording.durationSeconds;
          }
            return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, selectedRecording, playbackSpeed]);

  const visibleEvents: RecordingEvent[] = selectedRecording
    ? selectedRecording.events.filter((e) => e.timestamp <= playbackTime)
    : [];

  // Replay code into editor as timeline progresses
  useEffect(() => {
    if (isPlaying && selectedRecording && onReplayCodeChange) {
      const codeEvents = visibleEvents.filter((e) => e.type === 'code');
      if (codeEvents.length > 0) {
        const latest = codeEvents[codeEvents.length - 1];
        if (latest && latest.detail) {
          onReplayCodeChange(latest.detail);
        }
      }
    }
  }, [playbackTime, isPlaying, selectedRecording, onReplayCodeChange]);

  const handleStart = async () => {
    try {
      const id = await onStartRecording(titleInput || `Session by ${currentUsername}`);
      setActiveRecordingId(id);
      setTitleInput('');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const handleStop = async () => {
    if (!activeRecordingId) return;
    try {
      const recording = await onStopRecording(activeRecordingId);
      setRecordings((prev) => [recording, ...prev]);
      setActiveRecordingId(null);
      setSelectedRecording(recording);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

const VideoIcon = () => (
  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

  const handleDownloadVideoRecording = (rec: SessionRecording) => {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mediaRecorder: MediaRecorder;
    try {
      const stream = canvas.captureStream(30);
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    } catch (e) {
      console.error('MediaRecorder error', e);
      return;
    }

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rec.title.replace(/\s+/g, '_')}_video.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();

    const maxSec = Math.max(1, rec.durationSeconds);
    let currentSec = 0;

    const interval = setInterval(() => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, 60);

      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`CodeSync Replay — ${rec.title}`, 20, 36);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText(`Time: ${currentSec}s / ${maxSec}s`, canvas.width - 160, 36);

      const visible = rec.events.filter((e) => e.timestamp <= currentSec);
      const codeEvent = visible.filter((e) => e.type === 'code').pop();

      ctx.fillStyle = '#020617';
      ctx.fillRect(20, 80, 580, 430);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(20, 80, 580, 430);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('Editor Buffer Stream', 35, 105);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px monospace';
      const lines = (codeEvent?.detail || '// Session code stream').split('\n').slice(0, 18);
      lines.forEach((line, idx) => {
        ctx.fillText(line, 35, 132 + idx * 20);
      });

      ctx.fillStyle = '#020617';
      ctx.fillRect(620, 80, 320, 430);
      ctx.strokeRect(620, 80, 320, 430);

      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Activity Stream Timeline', 635, 105);

      visible.slice(-7).forEach((evt, idx) => {
        ctx.fillStyle = evt.type === 'code' ? '#818cf8' : evt.type === 'chat' ? '#34d399' : '#f59e0b';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`[${evt.type.toUpperCase()}] ${evt.author}:`, 635, 135 + idx * 42);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        const txt = evt.detail.length > 32 ? evt.detail.substring(0, 30) + '...' : evt.detail;
        ctx.fillText(txt, 635, 153 + idx * 42);
      });

      currentSec++;
      if (currentSec > maxSec) {
        clearInterval(interval);
        mediaRecorder.stop();
      }
    }, 100);
  };

  const handleDownloadRecording = (rec: SessionRecording) => {
    const jsonStr = JSON.stringify(rec, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rec.title.replace(/\s+/g, '_')}_${rec.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteRecording = async (recId: string) => {
    if (selectedRecording?.id === recId) {
      setSelectedRecording(null);
      setIsPlaying(false);
    }
    setRecordings((prev) => prev.filter((r) => r.id !== recId));
    if (onDeleteRecording) {
      try {
        await onDeleteRecording(recId);
      } catch (err) {
        console.error('Failed to delete recording', err);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200 overflow-hidden min-w-0">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 truncate">Session Recordings</span>
          {activeRecordingId && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-2xs font-bold animate-pulse whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> REC {formatTime(recordingSeconds)}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col space-y-4 overflow-y-auto min-w-0">
        {/* Record Controls Box */}
        <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 space-y-3 min-w-0">
          <h4 className="text-xs font-semibold text-gray-300 truncate">
            {activeRecordingId ? 'Active Recording in Progress' : 'Start New Recording'}
          </h4>

          {!activeRecordingId ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Recording Title (optional)..."
                className="flex-1 min-w-[120px] bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleStart}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <span className="w-2 h-2 rounded-full bg-white"></span> Record
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-gray-400 font-mono">Duration: {formatTime(recordingSeconds)}</span>
              <button
                onClick={handleStop}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-red-400 border border-red-500/30 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                ■ Stop & Save
              </button>
            </div>
          )}
        </div>

        {/* Selected Replay Player view */}
        {selectedRecording && (
          <div className="p-3.5 bg-gray-950/90 rounded-xl border border-indigo-500/30 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-between border-b border-gray-800 pb-2 gap-2">
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-indigo-400 truncate">{selectedRecording.title}</h4>
                <span className="text-2xs text-gray-400 block truncate">
                  {new Date(selectedRecording.createdAt).toLocaleDateString()} • {selectedRecording.eventCount} events
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownloadVideoRecording(selectedRecording)}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 text-indigo-400 rounded-lg border border-gray-700 transition-colors"
                  title="Download Session Video (.webm)"
                >
                  <VideoIcon />
                </button>
                <button
                  onClick={() => handleDownloadRecording(selectedRecording)}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
                  title="Download Session JSON"
                >
                  <DownloadIcon />
                </button>
                <button
                  onClick={() => {
                    setSelectedRecording(null);
                    setIsPlaying(false);
                  }}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap border border-gray-700"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Scrubber & Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-2xs font-mono text-gray-400">
                <span>{formatTime(playbackTime)}</span>
                <span>{formatTime(selectedRecording.durationSeconds)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={selectedRecording.durationSeconds}
                value={playbackTime}
                onChange={(e) => setPlaybackTime(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              <div className="flex flex-wrap items-center justify-between pt-1 gap-2">
                <button
                  onClick={() => {
                    if (selectedRecording && playbackTime >= selectedRecording.durationSeconds) {
                      setPlaybackTime(0);
                      setIsPlaying(true);
                    } else {
                      setIsPlaying(!isPlaying);
                    }
                  }}
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm"
                  title={isPlaying ? 'Pause Replay' : 'Play Replay'}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>

                <div className="flex flex-wrap items-center gap-1">
                  {[1, 2, 4].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
                        playbackSpeed === speed
                          ? 'bg-gray-700 text-indigo-400 border border-indigo-500/40'
                          : 'bg-gray-900 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Event Timeline Stream */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {visibleEvents.map((evt, idx) => (
                <div key={idx} className="p-2 bg-gray-900/60 rounded-lg border border-gray-800/60 text-2xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                    <span className="font-mono text-3xs text-indigo-400 uppercase">
                      [{evt.type}]
                    </span>
                    <span className="font-bold text-gray-300 truncate">{evt.author}:</span>
                    <span className="text-gray-400 truncate">{evt.detail}</span>
                  </div>
                  <span className="font-mono text-gray-500 ml-2 whitespace-nowrap">{formatTime(evt.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Recordings List */}
        <div className="space-y-2 min-w-0">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 truncate">Saved Replays ({recordings.length})</h4>
          {recordings.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-xl">
              No session recordings yet. Click <span className="text-red-400 font-bold">Record</span> to capture live workspace events.
            </div>
          ) : (
            <div className="space-y-2">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => {
                    setSelectedRecording(rec);
                    setPlaybackTime(0);
                    setIsPlaying(true);
                  }}
                  className={`p-3 bg-gray-950/70 hover:bg-gray-950 border rounded-xl cursor-pointer transition-all flex flex-wrap items-center justify-between gap-2 ${
                    selectedRecording?.id === rec.id ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h5 className="text-xs font-semibold text-gray-200 truncate">{rec.title}</h5>
                    <span className="text-2xs text-gray-400 font-mono block truncate">
                      Duration: {formatTime(rec.durationSeconds)} • {rec.eventCount} events
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecording(rec);
                        setPlaybackTime(0);
                        setIsPlaying(true);
                      }}
                      className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors"
                      title="Play Session Replay"
                    >
                      <PlayIcon />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadVideoRecording(rec);
                      }}
                      className="p-1.5 bg-gray-800 hover:bg-gray-700 text-indigo-400 rounded-lg border border-gray-700 transition-colors"
                      title="Download Session Video (.webm)"
                    >
                      <VideoIcon />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadRecording(rec);
                      }}
                      className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
                      title="Download Session JSON"
                    >
                      <DownloadIcon />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecording(rec.id);
                      }}
                      className="p-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg transition-colors"
                      title="Delete Session"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
