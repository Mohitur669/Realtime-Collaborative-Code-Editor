import React from 'react';
import { ClientInfo } from '@codesync/shared-types';

interface UsersPanelProps {
  clients: ClientInfo[];
  currentUsername: string;
  creatorUsername?: string;
  mutedUserSockets: string[];
  onMuteUser: (targetSocketId: string, targetUsername: string, mute: boolean) => void;
  onKickUser: (targetSocketId: string, targetUsername: string) => void;
}

export const UsersPanel: React.FC<UsersPanelProps> = ({
  clients,
  currentUsername,
  creatorUsername,
  mutedUserSockets,
  onMuteUser,
  onKickUser,
}) => {
  // Room Creator check: if creatorUsername is specified, check against it.
  // Default first client in room as creator host if not specified.
  const hostName = creatorUsername || (clients[0] ? clients[0].username : currentUsername);
  const isCreator = currentUsername === hostName;

  // Deduplicate user list by username so same participant is never shown multiple times
  const uniqueClients = clients.filter(
    (c, idx, self) => idx === self.findIndex((item) => item.username === c.username)
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200 overflow-hidden min-w-0">
      {/* Panel Header */}
      <div className="p-3 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Room Participants ({uniqueClients.length})</h4>
          <p className="text-2xs text-gray-500 mt-0.5">
            Host: <span className="text-indigo-400 font-semibold">{hostName}</span> {isCreator ? '(You are Host)' : ''}
          </p>
        </div>
        {isCreator && (
          <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-2xs font-mono">
            Admin Controls Active
          </span>
        )}
      </div>

      {/* Users List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 min-h-0">
        {uniqueClients.map((client) => {
          const isMe = client.username === currentUsername;
          const isHost = client.username === hostName;
          const isMuted = mutedUserSockets.includes(client.socketId);

          return (
            <div
              key={client.socketId}
              className="p-3 bg-gray-950/70 border border-gray-800 rounded-xl flex flex-wrap items-center justify-between gap-2 transition-all hover:border-gray-700"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white border border-gray-700 shrink-0 shadow-sm"
                  style={{ backgroundColor: isHost ? '#6366f1' : '#3b82f6' }}
                >
                  {client.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-gray-100 truncate">{client.username}</span>
                    {isMe && <span className="text-3xs px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded font-mono">(You)</span>}
                    {isHost && (
                      <span className="text-3xs px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded font-mono font-bold">
                        Host
                      </span>
                    )}
                  </div>
                  <span className="text-2xs text-gray-500 font-mono block truncate">
                    ID: {client.socketId.substring(0, 8)} • {isMuted ? 'Muted' : 'Active'}
                  </span>
                </div>
              </div>

              {/* Controls for Creator / Admin */}
              {isCreator && !isMe && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onMuteUser(client.socketId, client.username, !isMuted)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      isMuted
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                    title={isMuted ? 'Unmute User' : 'Mute User'}
                  >
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <button
                    onClick={() => onKickUser(client.socketId, client.username)}
                    className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold rounded-lg transition-colors"
                    title="Remove / Kick User from Room"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
