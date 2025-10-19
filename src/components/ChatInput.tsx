'use client';

import { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !disabled) {
        onSendMessage(message.trim());
        setMessage('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about our service, pricing, refunds, or getting started..."
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 text-sm leading-relaxed"
          disabled={disabled}
          rows={1}
          style={{
            minHeight: '48px',
            maxHeight: '120px',
            height: '48px'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = '48px';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd>
            <span>to send,</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Shift+Enter</kbd>
            <span>for new line</span>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 font-medium text-sm h-12"
      >
        <span>Send</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}
