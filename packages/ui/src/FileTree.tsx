import React, { useState } from 'react';

export interface FileItem {
  id: string;
  name: string;
  isFolder: boolean;
  path: string;
  children?: FileItem[];
}

interface FileTreeProps {
  files: string[];
  activeFile: string;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string) => void;
  onCreateFolder?: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  onExportZip: () => void;
  onImportZip: (file: File) => void;
  onUploadClick?: () => void;
}

const UploadIcon = () => (
  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return { color: 'text-amber-400', tag: 'JS' };
    case 'ts':
    case 'tsx':
      return { color: 'text-blue-400', tag: 'TS' };
    case 'py':
      return { color: 'text-yellow-400', tag: 'PY' };
    case 'html':
      return { color: 'text-orange-400', tag: 'HTML' };
    case 'css':
      return { color: 'text-sky-400', tag: 'CSS' };
    case 'json':
      return { color: 'text-green-400', tag: 'JSON' };
    case 'md':
      return { color: 'text-purple-400', tag: 'MD' };
    default:
      return { color: 'text-gray-400', tag: 'TXT' };
  }
};

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onExportZip,
  onImportZip,
  onUploadClick,
}) => {
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const cleanName = newFileName.trim().startsWith('/') ? newFileName.trim().slice(1) : newFileName.trim();
    onCreateFile(cleanName);
    setNewFileName('');
    setIsCreating(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportZip(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full min-w-0 overflow-hidden bg-gray-950 border-r border-gray-800 text-gray-200 select-none">
      {/* Explorer Header */}
      <div className="px-3 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Explorer</span>
          <span className="text-[10px] font-mono text-gray-500">({files.length})</span>
        </div>

        <div className="flex items-center gap-1">
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="p-1 hover:bg-gray-800 text-gray-400 hover:text-indigo-400 rounded transition-colors text-xs font-semibold"
              title="Upload File"
            >
              <UploadIcon />
            </button>
          )}
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-1 hover:bg-gray-800 text-gray-400 hover:text-indigo-400 rounded transition-colors text-xs font-semibold"
            title="Create New File"
          >
            <span className="text-sm leading-none">+</span>
          </button>
        </div>
      </div>

      {/* New File Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-2.5 bg-gray-900/90 border-b border-gray-800 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. index.ts or utils.js"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="flex-1 bg-gray-950 text-xs px-2.5 py-1.5 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-indigo-500 font-mono"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* File Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {files.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 italic border border-dashed border-gray-800 rounded-xl my-4">
            No files in project workspace. Click <span className="text-indigo-400 font-bold">+ File</span> to create one.
          </div>
        ) : (
          files.map((filePath) => {
            const isActive = activeFile === filePath;
            const meta = getFileIcon(filePath);

            return (
              <div
                key={filePath}
                onClick={() => onSelectFile(filePath)}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 font-semibold shadow-sm'
                    : 'bg-gray-900/40 border-transparent hover:bg-gray-900 hover:border-gray-800 text-gray-300'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-500 rounded-r" />}

                <div className="flex items-center gap-2 truncate pl-1">
                  <span className="truncate font-mono text-xs">{filePath}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-gray-950 border border-gray-800 ${meta.color}`}>
                    {meta.tag}
                  </span>

                  {files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(filePath);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 text-gray-500 rounded transition-all"
                      title="Delete File"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Export / Import Zip Action Row at Bottom */}
      <div className="p-2 bg-gray-950 border-t border-gray-800 flex items-center justify-between gap-2">
        <button
          onClick={onExportZip}
          className="flex-1 py-1.5 px-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-gray-100 rounded-lg text-xs font-semibold transition-colors border border-gray-800 text-center"
          title="Export Project Zip"
        >
          Export ZIP
        </button>
        <label
          className="flex-1 py-1.5 px-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-gray-100 rounded-lg text-xs font-semibold transition-colors border border-gray-800 cursor-pointer text-center"
          title="Import Project Zip"
        >
          Import ZIP
          <input type="file" accept=".zip" onChange={handleImport} className="hidden" />
        </label>
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2 bg-gray-900/80 border-t border-gray-800 text-[10px] text-gray-400 flex items-center justify-between font-mono tracking-tight">
        <span>Sync Workspace</span>
        <span className="text-emerald-400 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Realtime
        </span>
      </div>
    </div>
  );
};
