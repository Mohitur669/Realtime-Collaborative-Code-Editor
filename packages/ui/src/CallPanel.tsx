import React, { useState } from 'react';
import { LiveKitTokenResponse } from '@codesync/shared-types';

interface CallPanelProps {
  roomId: string;
  username: string;
  onFetchToken: () => Promise<LiveKitTokenResponse>;
}

const MicIcon = ({ active }: { active: boolean }) => (
  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    {active ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V6a3 3 0 00-6 0v6.75a3 3 0 003 3z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V6a3 3 0 00-6 0v6.75a3 3 0 003 3zM3 3l18 18" />
    )}
  </svg>
);

const CameraIcon = ({ active }: { active: boolean }) => (
  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    {active ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25zM3 3l18 18" />
    )}
  </svg>
);

const ScreenShareIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
  </svg>
);

const PhoneOffIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12" />
  </svg>
);

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
        <span className="text-xs font-bold tracking-wider text-gray-400">Audio / Video Call</span>
        <span className="text-xs text-gray-500 font-mono">{joined ? 'Connected' : 'Disconnected'}</span>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto">
        {!isConfigured && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs mb-4">
            LiveKit credentials not set in environment. Running in dev fallback mode. Set <code className="font-mono font-bold">livekit_api_key</code> to enable full SFU stream routing.
          </div>
        )}

        {!joined ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-xs font-mono font-bold border border-gray-700 text-indigo-400">
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
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md shadow-indigo-600/20"
            >
              {loading ? 'Connecting...' : 'Join Call'}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {/* Participant Video Grid Mock Preview */}
            <div className="flex-1 bg-gray-950 rounded-xl border border-gray-800 p-4 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center border-2 border-indigo-500 text-indigo-400 font-bold text-xl mb-2 animate-pulse">
                {username.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-gray-200">{username} (You)</span>
              <span className="text-2xs text-sky-400 mt-1 font-mono">
                {screenShare ? 'Sharing Screen' : micOn ? 'Mic Active' : 'Muted'}
              </span>

              {token && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-900/80 border border-gray-700 rounded text-2xs text-gray-400 font-mono">
                  SFU Ready
                </div>
              )}
            </div>

            {/* Controls Bar — minimal icon buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-2.5 rounded-full transition-all border shadow-sm ${
                  micOn ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' : 'bg-red-600/20 text-red-400 border-red-500/30'
                }`}
                title={micOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                <MicIcon active={micOn} />
              </button>

              <button
                onClick={() => setCamOn(!camOn)}
                className={`p-2.5 rounded-full transition-all border shadow-sm ${
                  camOn ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' : 'bg-red-600/20 text-red-400 border-red-500/30'
                }`}
                title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                <CameraIcon active={camOn} />
              </button>

              <button
                onClick={() => setScreenShare(!screenShare)}
                className={`p-2.5 rounded-full transition-all border shadow-sm ${
                  screenShare ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
                }`}
                title={screenShare ? 'Stop Sharing Screen' : 'Share Screen'}
              >
                <ScreenShareIcon />
              </button>

              <button
                onClick={handleLeaveCall}
                className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all shadow-md shadow-red-600/20"
                title="Leave Call"
              >
                <PhoneOffIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
