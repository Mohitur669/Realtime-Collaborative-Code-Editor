import React from 'react';

export type ToolTab = 'users' | 'chat' | 'ai' | 'call' | 'whiteboard' | 'settings' | 'recordings';

interface ToolsPanelProps {
  activeTab: ToolTab;
  onSelectTab: (tab: ToolTab) => void;
  children?: React.ReactNode;
}

const UsersTabIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ChatTabIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 007.5 20.25a8.96 8.96 0 004.5 0z" />
  </svg>
);

const AiTabIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const CallTabIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const BoardTabIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);

const RecTabIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.5" className="fill-current" />
  </svg>
);

const ConfigTabIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6h9.75M10.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6h9.75M10.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ activeTab, onSelectTab, children }) => {
  const tabs: { id: ToolTab; label: string; icon: React.ReactNode }[] = [
    { id: 'users', label: 'Users', icon: <UsersTabIcon /> },
    { id: 'chat', label: 'Chat', icon: <ChatTabIcon /> },
    { id: 'ai', label: 'AI Assistant', icon: <AiTabIcon /> },
    { id: 'call', label: 'Audio / Video Call', icon: <CallTabIcon /> },
    { id: 'whiteboard', label: 'Whiteboard', icon: <BoardTabIcon /> },
    { id: 'recordings', label: 'Session Recordings', icon: <RecTabIcon /> },
    { id: 'settings', label: 'Editor Settings', icon: <ConfigTabIcon /> },
  ];

  return (
    <div className="flex flex-col h-full min-w-0 overflow-hidden bg-gray-900 border-l border-gray-800 text-gray-200 select-none">
      {/* Header Tabs — minimal SVG icons */}
      <div className="flex border-b border-gray-800 bg-gray-950 overflow-x-auto no-scrollbar flex-shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              title={tab.label}
              className={`flex items-center justify-center p-2.5 border-b-2 transition-all flex-1 min-w-0 ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
              }`}
            >
              {tab.icon}
            </button>
          );
        })}
      </div>

      {/* Tab Content Shell */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 bg-gray-900 min-h-0">{children}</div>
    </div>
  );
};
