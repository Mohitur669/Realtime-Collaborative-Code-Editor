import React, { useState } from 'react';
import { ClientInfo } from '@codesync/shared-types';

interface UsersPanelProps {
  clients: ClientInfo[];
  currentUsername: string;
  creatorUsername?: string;
  mutedUserSockets: string[];
  onMuteUser: (targetSocketId: string, targetUsername: string, mute: boolean) => void;
  onKickUser: (targetSocketId: string, targetUsername: string) => void;
}

const MuteIcon = ({ isMuted }: { isMuted: boolean }) => (
  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    {isMuted ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V6a3 3 0 00-6 0v6.75a3 3 0 003 3zM3 3l18 18" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V6a3 3 0 00-6 0v6.75a3 3 0 003 3z" />
    )}
  </svg>
);

const UserRemoveIcon = () => (
  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.375 21c-2.33 0-4.512-.645-6.374-1.766z" />
  </svg>
);

export const UsersPanel: React.FC<UsersPanelProps> = ({
  clients,
  currentUsername,
  creatorUsername,
  mutedUserSockets,
  onMuteUser,
  onKickUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const hostName = creatorUsername || (clients[0] ? clients[0].username : currentUsername);
  const isCreator = currentUsername === hostName;

  // Deduplicate user list by username so same participant is never shown multiple times
  const uniqueClients = clients.filter(
    (c, idx, self) => idx === self.findIndex((item) => item.username === c.username)
  );

  // Sort so host/admin is always at the top
  const sortedClients = [...uniqueClients].sort((a, b) => {
    if (a.username === hostName) return -1;
    if (b.username === hostName) return 1;
    return 0;
  });

  const filteredClients = sortedClients.filter((c) =>
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const paginatedClients = filteredClients.slice((validPage - 1) * ITEMS_PER_PAGE, validPage * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200 overflow-hidden min-w-0">
      {/* Panel Header */}
      <div className="p-3 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-xs font-bold tracking-wider text-gray-400">
            Room Participants ({uniqueClients.length})
          </h4>
          <p className="text-2xs text-gray-500 mt-0.5">
            Host: <span className="text-indigo-400 font-semibold">{hostName}</span>
          </p>
        </div>
      </div>

      {/* Search Filter input if participants > 5 */}
      {uniqueClients.length > 5 && (
        <div className="p-2 border-b border-gray-800 bg-gray-950/60">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search participants..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      )}

      {/* Users List (Paginated, max 10 per page) */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 min-h-0">
        {paginatedClients.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 italic border border-dashed border-gray-800 rounded-xl my-2">
            No participants found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          paginatedClients.map((client) => {
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
                      Status: {isMuted ? 'Muted' : 'Active'}
                    </span>
                  </div>
                </div>

                {/* Controls for Creator / Admin — minimal SVG icon buttons */}
                {isCreator && !isMe && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onMuteUser(client.socketId, client.username, !isMuted)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isMuted
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                          : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                      }`}
                      title={isMuted ? 'Unmute User' : 'Mute User'}
                    >
                      <MuteIcon isMuted={isMuted} />
                    </button>
                    <button
                      onClick={() => onKickUser(client.socketId, client.username)}
                      className="p-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg transition-colors"
                      title="Remove / Kick User from Room"
                    >
                      <UserRemoveIcon />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-2 border-t border-gray-800 bg-gray-950 flex items-center justify-between text-2xs font-mono text-gray-400">
          <button
            disabled={validPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-800 rounded-lg text-gray-300 transition-colors"
          >
            ← Prev
          </button>
          <span>
            Page {validPage} of {totalPages}
          </span>
          <button
            disabled={validPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-800 rounded-lg text-gray-300 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};
