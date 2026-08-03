import React, { useState } from 'react';
import { LiveKitTokenResponse } from '@codesync/shared-types';

interface CallPanelProps {
  roomId: string;
  username: string;
  onFetchToken: () => Promise<LiveKitTokenResponse>;
}

export const CallPanel: React.FC<CallPanelProps> = ({ username, onFetchToken }) => {
  const [joined, setJoined] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoinCall = async () => {
    setLoading(true);
    try {
      const res = await onFetchToken();
      setIsConfigured(res.isConfigured);
      setToken(res.token);
      setJoined(true);
    } catch (err) {
      console.error('Failed to fetch LiveKit token', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCall = () => {
    setJoined(false);
    setToken(null);
    setScreenShare(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Audio / Video Call</span>
        <span className="text-xs text-gray-500 font-mono">{joined ? 'Connected' : 'Disconnected'}</span>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto">
        {!isConfigured && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs mb-4">
            LiveKit credentials not set in environment. Running in dev fallback mode. Set <code className="font-mono font-bold">LIVEKIT_API_KEY</code> to enable full SFU stream routing.
          </div>
        )}

        {!joined ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-xs font-mono font-bold border border-gray-700 text-green-400">
              AV
            </div>
            <div>
              <h4 className="font-bold text-gray-100 text-sm">Join Audio / Video Call</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Connect with team members in this room for real-time voice, video, and screen sharing.
              </p>
            </div>
            <button
              onClick={handleJoinCall}
              disabled={loading}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-gray-950 font-semibold rounded-lg text-xs transition-all shadow-md shadow-green-500/20"
            >
              {loading ? 'Connecting...' : 'Join Call'}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {/* Participant Video Grid Mock Preview */}
            <div className="flex-1 bg-gray-950 rounded-xl border border-gray-800 p-4 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 text-green-400 font-bold text-xl mb-2 animate-pulse">
                {username.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-gray-200">{username} (You)</span>
              <span className="text-2xs text-green-400 mt-1 font-mono">
                {screenShare ? 'Sharing Screen' : micOn ? 'Mic Active' : 'Muted'}
              </span>

              {token && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-900/80 border border-gray-700 rounded text-2xs text-gray-400 font-mono">
                  SFU Ready
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  micOn ? 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700' : 'bg-red-600/20 text-red-400 border border-red-500/30'
                }`}
                title={micOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micOn ? 'Mic On' : 'Muted'}
              </button>

              <button
                onClick={() => setCamOn(!camOn)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  camOn ? 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700' : 'bg-red-600/20 text-red-400 border border-red-500/30'
                }`}
                title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {camOn ? 'Cam On' : 'Cam Off'}
              </button>

              <button
                onClick={() => setScreenShare(!screenShare)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  screenShare ? 'bg-green-500 text-gray-950' : 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700'
                }`}
                title="Share Screen"
              >
                Share
              </button>

              <button
                onClick={handleLeaveCall}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                title="Leave Call"
              >
                Leave
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
