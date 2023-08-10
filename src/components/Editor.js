import React, { useEffect } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

function Editor() {
    useEffect(() => {
        const textarea = document.getElementById('realtimeEditor');
        const editor = CodeMirror.fromTextArea(textarea, {
            mode: 'javascript',
            theme: 'dracula',
            autoCloseTags: true,
            autoCloseBrackets: true,
            lineNumbers: true,
        });

        return () => {
            editor.toTextArea(); // Clean up the CodeMirror instance
        };
    }, []);

    return (
        <textarea id="realtimeEditor"></textarea>
    );
}

export default Editor;