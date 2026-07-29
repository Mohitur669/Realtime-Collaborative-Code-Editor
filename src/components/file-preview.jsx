const FilePreview = ({
  setFilePreview,
  fileContent,
  resetFileInput,
  onAppend,
  onReplace,
}) => {
  const handleCancel = () => {
    resetFileInput();
    setFilePreview(false);
  };

  return (
    <div className="dialogOverlay" role="dialog" aria-modal="true">
      <div className="dialogContent">
        <div className="dialogHeader">
          <h3>File preview</h3>
        </div>
        <div className="dialogBody">
          <pre>
            <code>{fileContent}</code>
          </pre>
        </div>
        <div className="dialogFooter">
          <button type="button" className="btn btn-outline" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-secondary" onClick={onAppend}>
            Append
          </button>
          <button type="button" className="btn btn-destructive" onClick={onReplace}>
            Replace
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
