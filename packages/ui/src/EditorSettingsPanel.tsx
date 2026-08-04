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
    <div className="space-y-5 text-sm text-gray-200">
      {/* Title */}
      <div className="pb-3 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Editor Configurations</h3>
          <p className="text-2xs text-gray-500 mt-0.5">Customize font, theme, syntax, and keybindings</p>
        </div>
      </div>

      {/* Font Family Config Card */}
      <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 space-y-2">
        <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
          <span>Font Family</span>
          <span className="text-2xs font-mono text-gray-500">Monospace</span>
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => onChangeSettings({ fontFamily: e.target.value })}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
        >
          {MONOSPACE_FONTS.map((font) => (
            <option key={font.value} value={font.value} className="bg-gray-900 text-gray-200">
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size Slider Card */}
      <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-300">
          <span>Font Size</span>
          <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 rounded text-2xs font-mono text-indigo-400 font-bold">
            {settings.fontSize}px
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="24"
          value={settings.fontSize}
          onChange={(e) => onChangeSettings({ fontSize: Number(e.target.value) })}
          className="w-full accent-indigo-500 bg-gray-900 h-1.5 rounded-lg cursor-pointer"
        />
      </div>

      {/* Language Mode Config Card */}
      <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 space-y-2">
        <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
          <span>Language Syntax</span>
          <span className="text-2xs font-mono text-gray-500">Grammar</span>
        </label>
        <select
          value={settings.language}
          onChange={(e) => onChangeSettings({ language: e.target.value })}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
        >
          {languages.map((l) => (
            <option key={l.value} value={l.value} className="bg-gray-900 text-gray-200">
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Syntax Theme Config Card */}
      <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 space-y-2">
        <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
          <span>Editor Theme</span>
          <span className="text-2xs font-mono text-gray-500">Colorway</span>
        </label>
        <select
          value={settings.theme}
          onChange={(e) => onChangeSettings({ theme: e.target.value })}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
        >
          {themes.map((t) => (
            <option key={t.value} value={t.value} className="bg-gray-900 text-gray-200">
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Keybinding Mode Selector */}
      <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800 space-y-2">
        <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
          <span>Keybinding Mode</span>
          <span className="text-2xs font-mono text-gray-500">Keyboard</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {(['standard', 'vim', 'emacs'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onChangeSettings({ keybinding: mode })}
              className={`py-1.5 text-xs font-semibold capitalize rounded-lg border transition-all ${
                settings.keybinding === mode
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Code Execution Disabled Flag / Placeholder per AGENTS.md rule 4 */}
      <div className="p-3.5 bg-gray-950/40 rounded-xl border border-gray-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
          <span>Code Execution</span>
          <span className="text-2xs text-amber-400 font-mono">Scope Gate</span>
        </div>
        <button
          disabled
          className="w-full py-2 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-xs font-semibold text-gray-500 cursor-not-allowed text-center transition-colors"
          title="In-browser code execution is explicitly out of scope"
        >
          Run — coming soon
        </button>
        {/* TODO(execution): Phase 16, not yet approved */}
      </div>
    </div>
  );
};
