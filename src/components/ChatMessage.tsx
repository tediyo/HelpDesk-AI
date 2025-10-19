'use client';

import { ChatMessage as ChatMessageType, Citation } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6`}>
      <div className={`flex items-start space-x-2 sm:space-x-3 max-w-full sm:max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
          message.role === 'user' 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
        }`}>
          {message.role === 'user' ? '👤' : '🤖'}
        </div>
        
        {/* Message Content */}
        <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block ${
            message.role === 'user'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          } rounded-xl sm:rounded-2xl px-3 sm:px-6 py-3 sm:py-4 shadow-sm hover:shadow-md transition-shadow duration-200`}>
            
            {/* Message Text */}
            <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
              {message.content}
            </div>
            
            {/* Safety Information */}
            {message.safetyInfo && (
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full font-medium ${
                    message.safetyInfo.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                    message.safetyInfo.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    message.safetyInfo.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {message.safetyInfo.isSafe ? '✅ Safe' : '⚠️ Risk: ' + message.safetyInfo.riskLevel}
                  </span>
                  <span className="text-gray-500 text-xs">
                    Confidence: {Math.round(message.safetyInfo.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}
            
            {/* Citations */}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-600 mb-1 sm:mb-2 flex items-center gap-1">
                  <span>📚</span>
                  Sources
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {message.citations.map((citation, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 sm:px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium cursor-pointer transition-colors duration-200"
                      title={citation.text}
                    >
                      <span className="mr-1">📄</span>
                      <span className="hidden sm:inline">{citation.filename} §{citation.paragraphIndex + 1}</span>
                      <span className="sm:hidden">{citation.filename}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-gray-500 mt-1 sm:mt-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}
