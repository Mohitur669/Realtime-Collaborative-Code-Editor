import React from 'react';

export type ToolTab = 'chat' | 'ai' | 'call' | 'whiteboard' | 'settings' | 'recordings';

interface ToolsPanelProps {
  activeTab: ToolTab;
  onSelectTab: (tab: ToolTab) => void;
  children?: React.ReactNode;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ activeTab, onSelectTab, children }) => {
  const tabs: { id: ToolTab; label: string; icon: string }[] = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'ai', label: 'AI Helper', icon: '🤖' },
    { id: 'call', label: 'A/V Call', icon: '📞' },
    { id: 'whiteboard', label: 'Whiteboard', icon: '🎨' },
    { id: 'recordings', label: 'Recordings', icon: '📹' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex flex-col h-full min-w-[260px] overflow-x-hidden bg-gray-900 border-l border-gray-800 text-gray-200 select-none">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-950 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-green-500 text-green-400 bg-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Shell */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">{children}</div>
    </div>
  );
};
