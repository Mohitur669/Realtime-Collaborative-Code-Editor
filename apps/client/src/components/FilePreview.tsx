import React, { useState } from 'react';

interface FilePreviewProps {
  setFilePreview: (show: boolean) => void;
  fileContent: string;
  currentCode?: string;
  resetFileInput: () => void;
  onAppend: () => void;
  onReplace: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  setFilePreview,
  fileContent,
  currentCode = '',
  resetFileInput,
  onAppend,
  onReplace,
}) => {
  const [viewMode, setViewMode] = useState<'diff' | 'raw'>('diff');

  const handleClose = () => {
    setFilePreview(false);
    resetFileInput();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-3.5 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wider">File Diff & Preview</h3>
            <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('diff')}
                className={`px-2.5 py-1 text-2xs font-bold rounded-md transition-colors ${
                  viewMode === 'diff' ? 'bg-green-500 text-gray-950' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Side-by-Side Diff
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-2.5 py-1 text-2xs font-bold rounded-md transition-colors ${
                  viewMode === 'raw' ? 'bg-green-500 text-gray-950' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                New File Only
              </button>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Diff Content Viewport */}
        <div className="flex-1 overflow-y-auto bg-gray-950 p-4 font-mono text-xs">
          {viewMode === 'diff' ? (
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Left Diff Section: Existing Code */}
              <div className="flex flex-col bg-gray-900/80 rounded-xl border border-red-500/30 overflow-hidden">
                <div className="px-3 py-1.5 bg-red-500/10 border-b border-red-500/20 text-red-400 font-bold text-2xs uppercase tracking-wider flex items-center justify-between">
                  <span>Current Editor Code</span>
                  <span>{currentCode.split('\n').length} lines</span>
                </div>
                <div className="p-3 overflow-x-auto whitespace-pre-wrap text-gray-300 flex-1 leading-relaxed">
                  {currentCode || <span className="text-gray-500 italic">// Editor is currently empty</span>}
                </div>
              </div>

              {/* Right Diff Section: Incoming Code */}
              <div className="flex flex-col bg-gray-900/80 rounded-xl border border-green-500/30 overflow-hidden">
                <div className="px-3 py-1.5 bg-green-500/10 border-b border-green-500/20 text-green-400 font-bold text-2xs uppercase tracking-wider flex items-center justify-between">
                  <span>Uploaded File Code (New)</span>
                  <span>{fileContent.split('\n').length} lines</span>
                </div>
                <div className="p-3 overflow-x-auto whitespace-pre-wrap text-green-300 flex-1 leading-relaxed">
                  {fileContent}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 whitespace-pre-wrap text-gray-200 leading-relaxed overflow-x-auto">
              {fileContent}
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-3.5 bg-gray-950 border-t border-gray-800 flex justify-end gap-3 items-center">
          <button
            onClick={onAppend}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-bold rounded-xl text-xs transition-colors"
          >
            Append to Bottom
          </button>
          <button
            onClick={onReplace}
            className="px-4 py-2 bg-green-500 hover:bg-green-400 text-gray-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-green-500/20"
          >
            Replace Editor Content
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
