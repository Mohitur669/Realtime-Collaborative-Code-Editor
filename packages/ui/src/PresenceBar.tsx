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

const SunIcon = () => (
  <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 24 24">
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
  </svg>
);

const MoonIcon = () => (
  <svg className="w-3.5 h-3.5 text-indigo-400 fill-current" viewBox="0 0 24 24">
    <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

export const PresenceBar: React.FC<PresenceBarProps> = ({ users, theme = 'dracula', onToggleTheme }) => {
  // Deduplicate users by username so same user doesn't show multiple times
  const uniqueUsers = users.filter(
    (user, index, self) => index === self.findIndex((u) => u.username === user.username)
  );

  const isLight = theme === 'githubLight';

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-900/90 dark:bg-gray-900/90 light:bg-gray-100 border-b border-gray-800 dark:border-gray-800 light:border-gray-200 backdrop-blur justify-between min-w-0 transition-colors">
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 light:text-gray-600 whitespace-nowrap">Live Presence</span>
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
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
          CRDT Active
        </span>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="w-7 h-7 bg-gray-800 dark:bg-gray-800 light:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300 rounded-lg border border-gray-700 dark:border-gray-700 light:border-gray-300 transition-all flex items-center justify-center cursor-pointer select-none shadow-sm"
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <SunIcon /> : <MoonIcon />}
          </button>
        )}
      </div>
    </div>
  );
};
