import React from 'react';

export interface PresenceUser {
  socketId: string;
  username: string;
  color?: string;
  activeFile?: string;
}

interface PresenceBarProps {
  users: PresenceUser[];
  currentUsername: string;
  theme?: string;
  onToggleTheme?: () => void;
}

export const PresenceBar: React.FC<PresenceBarProps> = ({ users, theme = 'dracula', onToggleTheme }) => {
  // Deduplicate users by username so same user doesn't show multiple times
  const uniqueUsers = users.filter(
    (user, index, self) => index === self.findIndex((u) => u.username === user.username)
  );

  const isLight = theme === 'githubLight';

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-900/90 border-b border-gray-800 backdrop-blur justify-between min-w-0">
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">Live Presence</span>
        <div className="flex -space-x-2 overflow-hidden">
          {uniqueUsers.map((u) => (
            <div
              key={u.socketId || u.username}
              className="relative group w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white border-2 border-gray-900 shadow-md cursor-pointer shrink-0"
              style={{ backgroundColor: u.color || '#3b82f6' }}
              title={`${u.username} ${u.activeFile ? `(editing ${u.activeFile})` : ''}`}
            >
              {u.username.substring(0, 2).toUpperCase()}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-gray-700">
                {u.username} {u.activeFile ? `• ${u.activeFile}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5"></span>
          CRDT Active
        </span>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="w-6 h-6 bg-gray-800 hover:bg-gray-700 rounded-md border border-gray-700 transition-colors flex items-center justify-center cursor-pointer select-none"
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-amber-400' : 'bg-blue-400'}`} />
          </button>
        )}
      </div>
    </div>
  );
};
