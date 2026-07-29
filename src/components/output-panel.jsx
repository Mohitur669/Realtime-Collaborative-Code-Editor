const OutputPanel = ({ logs = [], running = false, durationMs = null, onClear }) => {
  return (
    <div className="outputPanel">
      <div className="outputPanelHeader">
        <div className="outputPanelTitle">
          <span>Output</span>
          {durationMs != null ? (
            <span className="badge">{durationMs} ms</span>
          ) : null}
          {running ? <span className="badge">Running…</span> : null}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="outputPanelBody">
        {logs.length === 0 ? (
          <p className="outputEmpty">
            Run JavaScript to see <code>console.log</code> output here.
          </p>
        ) : (
          logs.map((entry, index) => (
            <div key={`${entry.time}-${index}`} className={`outputLine output-${entry.type}`}>
              <span className="outputType">{entry.type}</span>
              <pre>{entry.text}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
