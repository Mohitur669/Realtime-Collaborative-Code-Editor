
const FilePreview = ({setFilePreview, fileContent, resetFileInput, onAppend, onReplace}) => {

    const handleCancel = () => {
        resetFileInput();
        setFilePreview(false);
    };

    return (
        <div className="filePreview">
            <div className="filePreviewContainer">
                <h3>File Preview</h3>
                <pre>
                    <code>
                        {fileContent}
                    </code>
                </pre>
                <div>
                    <button id="appendBtn" onClick={onAppend}>Append</button>
                    <button id="replaceBtn" onClick={onReplace}>Replace</button>
                    <button id="cancelBtn" onClick={() => handleCancel()}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default FilePreview;