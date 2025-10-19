'use client';

import { ChatMessage as ChatMessageType, Citation } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300">
            <div className="text-xs text-gray-600 mb-1">Sources:</div>
            <div className="flex flex-wrap gap-1">
              {message.citations.map((citation, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 cursor-pointer"
                  title={citation.text}
                >
                  {citation.filename} §{citation.paragraphIndex + 1}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
