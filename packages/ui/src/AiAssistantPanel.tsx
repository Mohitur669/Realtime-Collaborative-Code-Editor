import React, { useState } from 'react';
import { AiCompletionResponse } from '@codesync/shared-types';

interface AiAssistantPanelProps {
  activeCode: string;
  onCompletion: (
    prompt: string,
    action: 'explain' | 'generate' | 'refactor' | 'fix',
    contextCode?: string,
  ) => Promise<AiCompletionResponse>;
  onInsertCode: (snippet: string) => void;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  activeCode,
  onCompletion,
  onInsertCode,
}) => {
  const [prompt, setPrompt] = useState('');
  const [action, setAction] = useState<'explain' | 'generate' | 'refactor' | 'fix'>('generate');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiCompletionResponse | null>(null);

  const handleSubmit = async (overrideAction?: 'explain' | 'generate' | 'refactor' | 'fix') => {
    const act = overrideAction || action;
    const finalPrompt = prompt || (act === 'explain' ? 'Explain active file' : act === 'refactor' ? 'Refactor code' : 'Fix bugs');
    setLoading(true);
    try {
      const res = await onCompletion(finalPrompt, act, activeCode);
      setResponse(res);
    } catch (err) {
      console.error('AI Request failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (response?.result) {
      navigator.clipboard.writeText(response.result);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">🤖 AI Pair Programmer</span>
          <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded text-2xs font-mono">
            Copilot Ready
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col space-y-4 overflow-y-auto">
        {/* Preset Action Pills */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setAction('explain');
              handleSubmit('explain');
            }}
            className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
              action === 'explain'
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                : 'bg-gray-950/60 text-gray-400 border-gray-800 hover:border-gray-700'
            }`}
          >
            <span>💡</span> Explain Code
          </button>

          <button
            onClick={() => {
              setAction('refactor');
              handleSubmit('refactor');
            }}
            className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
              action === 'refactor'
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                : 'bg-gray-950/60 text-gray-400 border-gray-800 hover:border-gray-700'
            }`}
          >
            <span>🛠</span> Refactor
          </button>

          <button
            onClick={() => {
              setAction('fix');
              handleSubmit('fix');
            }}
            className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
              action === 'fix'
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                : 'bg-gray-950/60 text-gray-400 border-gray-800 hover:border-gray-700'
            }`}
          >
            <span>🐛</span> Fix Bugs
          </button>

          <button
            onClick={() => setAction('generate')}
            className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
              action === 'generate'
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                : 'bg-gray-950/60 text-gray-400 border-gray-800 hover:border-gray-700'
            }`}
          >
            <span>⚡</span> Custom Prompt
          </button>
        </div>

        {/* Custom Prompt Box */}
        <div className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI to generate code, write tests, or optimize algorithms..."
            rows={3}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-purple-500 resize-none font-mono"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-600/20"
          >
            {loading ? 'AI is thinking...' : 'Generate with AI'}
          </button>
        </div>

        {/* AI Output Stream */}
        {response && (
          <div className="p-3.5 bg-gray-950 rounded-xl border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider text-purple-400">
                Response ({response.action})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-2xs font-semibold rounded border border-gray-700"
                >
                  📋 Copy
                </button>
                <button
                  onClick={() => onInsertCode(response.result)}
                  className="px-2 py-0.5 bg-purple-500 hover:bg-purple-400 text-gray-950 text-2xs font-bold rounded"
                >
                  📥 Insert into Editor
                </button>
              </div>
            </div>

            <pre className="p-3 bg-gray-900 rounded-lg text-2xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap border border-gray-800">
              {response.result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
