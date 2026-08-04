import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@codesync/shared-types';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUsername: string;
  onSendMessage: (content: string) => void;
  roomUsers: string[];
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentUsername,
  onSendMessage,
  roomUsers,
}) => {
  const [input, setInput] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  const scrollToBottom = () => {
    if (isAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAutoScroll(isAtBottom);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Mention detection
    const match = value.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1].toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (username: string) => {
    setInput((prev) => prev.replace(/@(\w*)$/, `@${username} `));
    setMentionQuery(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
    setMentionQuery(null);
  };

  const filteredMentions = mentionQuery !== null
    ? roomUsers.filter((u) => u.toLowerCase().startsWith(mentionQuery))
    : [];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-gray-400">Room Chat</span>
        <span className="text-xs text-gray-500">{messages.length} messages</span>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-xs text-gray-500 italic text-center py-6">
            No messages yet. Send a message to start chatting!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderName === currentUsername;
            const hasMention = msg.content.includes(`@${currentUsername}`);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-2xs text-gray-400">
                  <span className="font-semibold text-gray-300">{msg.senderName}</span>
                  <span>•</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] break-words shadow-sm ${
                    hasMention
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                      : isMe
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-gray-800 text-gray-200 border border-gray-700'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mention Popup */}
      {mentionQuery !== null && filteredMentions.length > 0 && (
        <div className="p-1 bg-gray-800 border-t border-gray-700 max-h-24 overflow-y-auto">
          {filteredMentions.map((user) => (
            <div
              key={user}
              onClick={() => insertMention(user)}
              className="px-3 py-1 text-xs hover:bg-gray-700 rounded cursor-pointer text-indigo-400 font-mono"
            >
              @{user}
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Type message... (@username)"
          value={input}
          onChange={handleInputChange}
          className="flex-1 min-w-[120px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};
