import React from 'react';

export interface EditorSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  theme: string;
  language: string;
  keybinding: 'standard' | 'vim' | 'emacs';
}

interface EditorSettingsPanelProps {
  settings: EditorSettings;
  onChangeSettings: (newSettings: Partial<EditorSettings>) => void;
  languages: { label: string; value: string }[];
  themes: { label: string; value: string }[];
}

export const MONOSPACE_FONTS = [
  { label: 'Fira Code', value: "'Fira Code', monospace" },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { label: 'Source Code Pro', value: "'Source Code Pro', monospace" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'System Monospace', value: 'monospace' },
];

export const EditorSettingsPanel: React.FC<EditorSettingsPanelProps> = ({
  settings,
  onChangeSettings,
  languages,
  themes,
}) => {
  return (
    <div className="space-y-6 text-sm text-gray-200">
      <h3 className="text-base font-bold text-gray-100 pb-2 border-b border-gray-800">
        Editor Customization
      </h3>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400">Font Family</label>
        <select
          value={settings.fontFamily}
          onChange={(e) => onChangeSettings({ fontFamily: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          {MONOSPACE_FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-gray-400">
          <span>Font Size</span>
          <span className="text-green-400">{settings.fontSize}px</span>
        </div>
        <input
          type="range"
          min="10"
          max="24"
          value={settings.fontSize}
          onChange={(e) => onChangeSettings({ fontSize: Number(e.target.value) })}
          className="w-full accent-green-500 bg-gray-800 rounded-lg cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400">Language</label>
        <select
          value={settings.language}
          onChange={(e) => onChangeSettings({ language: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          {languages.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400">Syntax Theme</label>
        <select
          value={settings.theme}
          onChange={(e) => onChangeSettings({ theme: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          {themes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400">Keybinding Mode</label>
        <select
          value={settings.keybinding}
          onChange={(e) => onChangeSettings({ keybinding: e.target.value as any })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="standard">Standard</option>
          <option value="vim">Vim</option>
          <option value="emacs">Emacs</option>
        </select>
      </div>

      {/* Code Execution Disabled Flag / Placeholder per AGENTS.md non-negotiable rule 4 */}
      <div className="pt-4 border-t border-gray-800">
        <label className="text-xs font-semibold text-gray-400 block mb-2">Code Execution</label>
        <button
          disabled
          className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-lg text-xs font-medium text-gray-500 cursor-not-allowed text-center"
          title="In-browser code execution is disabled"
        >
          Run — coming soon
        </button>
        {/* TODO(execution): Phase 16, not yet approved */}
      </div>
    </div>
  );
};
