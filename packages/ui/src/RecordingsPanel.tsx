import React, { useState, useEffect } from 'react';
import { SessionRecording, RecordingEvent } from '@codesync/shared-types';

interface RecordingsPanelProps {
  roomId: string;
  currentUsername: string;
  onStartRecording: (title?: string) => Promise<string>;
  onStopRecording: (recordingId: string) => Promise<SessionRecording>;
  onFetchRecordings: () => Promise<SessionRecording[]>;
}

export const RecordingsPanel: React.FC<RecordingsPanelProps> = ({
  currentUsername,
  onStartRecording,
  onStopRecording,
  onFetchRecordings,
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const visibleEvents: RecordingEvent[] = selectedRecording
    ? selectedRecording.events.filter((e) => e.timestamp <= playbackTime)
    : [];

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
                className="flex-1 min-w-[120px] bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-green-500"
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
          <div className="p-3.5 bg-gray-950/90 rounded-xl border border-green-500/30 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-between border-b border-gray-800 pb-2 gap-2">
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-green-400 truncate">{selectedRecording.title}</h4>
                <span className="text-2xs text-gray-400 block truncate">
                  {new Date(selectedRecording.createdAt).toLocaleDateString()} • {selectedRecording.eventCount} events
                </span>
              </div>
              <button
                onClick={() => setSelectedRecording(null)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap border border-gray-700"
              >
                Close
              </button>
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
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500"
              />

              <div className="flex flex-wrap items-center justify-between pt-1 gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-gray-950 font-semibold rounded-lg text-xs transition-colors whitespace-nowrap"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>

                <div className="flex flex-wrap items-center gap-1">
                  {[1, 2, 4].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
                        playbackSpeed === speed
                          ? 'bg-gray-700 text-green-400 border border-green-500/40'
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
                    <span className="font-mono text-3xs text-green-400 uppercase">
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
                    setIsPlaying(false);
                  }}
                  className={`p-3 bg-gray-950/70 hover:bg-gray-950 border rounded-xl cursor-pointer transition-all flex flex-wrap items-center justify-between gap-2 ${
                    selectedRecording?.id === rec.id ? 'border-green-500/50 bg-green-500/5' : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h5 className="text-xs font-semibold text-gray-200 truncate">{rec.title}</h5>
                    <span className="text-2xs text-gray-400 font-mono block truncate">
                      Duration: {formatTime(rec.durationSeconds)} • {rec.eventCount} events
                    </span>
                  </div>
                  <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg border border-gray-700 whitespace-nowrap">
                    Play
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
