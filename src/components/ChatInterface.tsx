'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ThemeToggle from './ThemeToggle';
import { ChatMessage as ChatMessageType, Citation } from '@/lib/types';

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      role: 'user',
      content,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          throw new Error(`Rate limit exceeded. Please wait ${Math.ceil((errorData.resetTime - Date.now()) / 1000)} seconds before trying again.`);
        }
        
        // Handle safety blocked responses
        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.type === 'safety_blocked') {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `🚫 **Safety Blocked**: ${errorData.message}\n\n**Reasons**: ${errorData.reasons.join(', ')}\n\n**Suggestions**:\n${errorData.suggestions.map((s: string) => `• ${s}`).join('\n')}`,
              safetyInfo: {
                confidence: 0.9,
                riskLevel: errorData.riskLevel,
                isSafe: false
              }
            }]);
            return;
          }
        }
        
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let assistantContent = '';
      let citations: Citation[] = [];
      let safetyInfo: any = undefined;

      const assistantMessage: ChatMessageType = {
        role: 'assistant',
        content: '',
        citations: [],
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                assistantContent += data.content;
                setMessages(prev => 
                  prev.map((msg, index) => 
                    index === prev.length - 1 && msg.role === 'assistant'
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              } else if (data.type === 'citations') {
                citations = data.citations;
                setMessages(prev => 
                  prev.map((msg, index) => 
                    index === prev.length - 1 && msg.role === 'assistant'
                      ? { ...msg, citations }
                      : msg
                  )
                );
              } else if (data.type === 'safety_info') {
                safetyInfo = data;
                setMessages(prev => 
                  prev.map((msg, index) => 
                    index === prev.length - 1 && msg.role === 'assistant'
                      ? { ...msg, safetyInfo }
                      : msg
                  )
                );
              } else if (data.type === 'end') {
                // Stream completed, break out of the loop
                break;
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Professional Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">AI</span>
              </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">HelpDesk AI</h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Intelligent Customer Support Assistant</p>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-end space-x-1 sm:space-x-2">
                <ThemeToggle />
              <a 
                href="/safety" 
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                🛡️ <span className="hidden sm:inline">Safety</span>
              </a>
              <a 
                href="/analytics" 
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              >
                📊 <span className="hidden sm:inline">Analytics</span>
              </a>
              <a 
                href="/admin" 
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                ⚙️ <span className="hidden sm:inline">Admin</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Container */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col">
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 bg-transparent">
          {messages.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-white text-xl sm:text-2xl">💬</span>
              </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">Welcome to HelpDesk AI</h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                    I'm here to help you with questions about our service, pricing, refunds, and getting started. 
                    Ask me anything!
                  </p>
                  <div className="space-y-2 sm:space-y-3 max-w-lg mx-auto px-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Try asking:</p>
                <div className="grid gap-2">
                    <button
                      onClick={() => handleSendMessage('What are the pricing tiers and what\'s included?')}
                      className="text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-900 dark:text-white text-sm sm:text-base"
                    >
                      <span className="font-medium">💰</span> What are the pricing tiers and what's included?
                    </button>
                    <button
                      onClick={() => handleSendMessage('How do I get an API key to start?')}
                      className="text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-900 dark:text-white text-sm sm:text-base"
                    >
                      <span className="font-medium">🔑</span> How do I get an API key to start?
                    </button>
                    <button
                      onClick={() => handleSendMessage('Can I get a refund after 20 days?')}
                      className="text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-900 dark:text-white text-sm sm:text-base"
                    >
                      <span className="font-medium">💳</span> Can I get a refund after 20 days?
                    </button>
                </div>
              </div>
            </div>
          )}
          
          {messages.length > 0 && (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-3 sm:p-4">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
