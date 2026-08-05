import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EditorSettings } from '@codesync/ui';

interface SettingsState {
  settings: EditorSettings;
  updateSettings: (newSettings: Partial<EditorSettings>) => void;
  appTheme: 'dark' | 'light';
  toggleAppTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        fontFamily: "'Fira Code', monospace",
        fontSize: 14,
        lineHeight: 1.5,
        theme: 'oneDark',
        language: 'javascript',
        keybinding: 'standard',
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      appTheme: 'dark',
      toggleAppTheme: () =>
        set((state) => ({
          appTheme: state.appTheme === 'dark' ? 'light' : 'dark',
        })),
    }),
    {
      name: 'codesync-settings',
    },
  ),
);
