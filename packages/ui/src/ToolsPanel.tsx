import React from 'react';

export type ToolTab = 'users' | 'chat' | 'ai' | 'call' | 'whiteboard' | 'settings' | 'recordings';

interface ToolsPanelProps {
  activeTab: ToolTab;
  onSelectTab: (tab: ToolTab) => void;
  children?: React.ReactNode;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ activeTab, onSelectTab, children }) => {
  const tabs: { id: ToolTab; label: string }[] = [
    { id: 'users', label: 'Users' },
    { id: 'chat', label: 'Chat' },
    { id: 'ai', label: 'AI' },
    { id: 'call', label: 'Call' },
    { id: 'whiteboard', label: 'Board' },
    { id: 'recordings', label: 'Rec' },
    { id: 'settings', label: 'Config' },
  ];

  return (
    <div className="flex flex-col h-full min-w-0 overflow-hidden bg-gray-900 border-l border-gray-800 text-gray-200 select-none">
      {/* Header Tabs — horizontally scrollable, compact */}
      <div className="flex border-b border-gray-800 bg-gray-950 overflow-x-auto no-scrollbar flex-shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              title={tab.label}
              className={`flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex-1 min-w-0 ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
              }`}
            >
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Shell */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 bg-gray-900 min-h-0">{children}</div>
    </div>
  );
};
