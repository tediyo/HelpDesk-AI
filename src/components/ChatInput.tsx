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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about our service, pricing, refunds, or getting started..."
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-8 sm:pr-12 border border-blue-300 dark:border-blue-600 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-blue-50/30 dark:bg-blue-900/20 text-sm leading-relaxed scrollbar-hide overflow-hidden"
          disabled={disabled}
          rows={1}
          style={{
            minHeight: '44px',
            maxHeight: '120px',
            height: '44px'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = '44px';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
        {/* <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 hidden sm:block">
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">Enter</kbd>
            <span>to send,</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">Shift+Enter</kbd>
            <span>for new line</span>
          </div>
        </div> */}
      </div>
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-xl sm:rounded-2xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 font-medium text-sm h-11 sm:h-12"
      >
        <span className="hidden sm:inline">Send</span>
        <span className="sm:hidden">Send</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}
