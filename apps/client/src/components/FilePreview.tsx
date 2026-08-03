import React from 'react';

interface FilePreviewProps {
  setFilePreview: (show: boolean) => void;
  fileContent: string;
  resetFileInput: () => void;
  onAppend: () => void;
  onReplace: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  setFilePreview,
  fileContent,
  resetFileInput,
  onAppend,
  onReplace,
}) => {
  const handleClose = () => {
    setFilePreview(false);
    resetFileInput();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-850">
          <h3 className="text-lg font-semibold text-gray-100">File Preview</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors text-xl font-bold"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 font-mono text-sm bg-gray-900 text-gray-300 whitespace-pre-wrap border-y border-gray-800">
          {fileContent}
        </div>
        <div className="px-6 py-4 bg-gray-850 flex justify-end gap-3">
          <button
            onClick={onAppend}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Append to Editor
          </button>
          <button
            onClick={onReplace}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Replace Editor Content
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
