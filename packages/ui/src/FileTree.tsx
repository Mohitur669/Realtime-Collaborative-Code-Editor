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
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onExportZip,
  onImportZip,
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
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 text-gray-200 select-none">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Files</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
            title="New File"
          >
            + File
          </button>
          <button
            onClick={onExportZip}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors text-xs"
            title="Export Zip"
          >
            Export
          </button>
          <label className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors text-xs cursor-pointer">
            Import
            <input type="file" accept=".zip" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-2 border-b border-gray-800 flex gap-2 bg-gray-850">
          <input
            type="text"
            placeholder="filename.js"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="flex-1 bg-gray-800 text-xs px-2 py-1 border border-gray-700 rounded text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-500"
            autoFocus
          />
          <button type="submit" className="px-2 py-1 bg-green-500 text-gray-950 text-xs font-bold rounded">
            Add
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {files.length === 0 ? (
          <div className="text-xs text-gray-500 italic p-2">No files in project</div>
        ) : (
          files.map((filePath) => {
            const isActive = activeFile === filePath;
            return (
              <div
                key={filePath}
                onClick={() => onSelectFile(filePath)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  isActive ? 'bg-gray-800 text-green-400 font-medium' : 'hover:bg-gray-800/60 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-gray-500 font-mono">📄</span>
                  <span className="truncate">{filePath}</span>
                </div>
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(filePath);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-gray-500 transition-opacity"
                    title="Delete File"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
