'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Professional Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HelpDesk AI</h1>
                <p className="text-sm text-gray-600">Intelligent Customer Support Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a 
                href="/safety" 
                className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                🛡️ Safety
              </a>
              <a 
                href="/analytics" 
                className="px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                📊 Analytics
              </a>
              <a 
                href="/admin" 
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                ⚙️ Admin
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Container */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">💬</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to HelpDesk AI</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                I'm here to help you with questions about our service, pricing, refunds, and getting started. 
                Ask me anything!
              </p>
              <div className="space-y-3 max-w-lg mx-auto">
                <p className="text-sm font-medium text-gray-700">Try asking:</p>
                <div className="grid gap-2">
                  <button
                    onClick={() => handleSendMessage('What are the pricing tiers and what\'s included?')}
                    className="text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-900"
                  >
                    <span className="font-medium">💰</span> What are the pricing tiers and what's included?
                  </button>
                  <button
                    onClick={() => handleSendMessage('How do I get an API key to start?')}
                    className="text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-900"
                  >
                    <span className="font-medium">🔑</span> How do I get an API key to start?
                  </button>
                  <button
                    onClick={() => handleSendMessage('Can I get a refund after 20 days?')}
                    className="text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-900"
                  >
                    <span className="font-medium">💳</span> Can I get a refund after 20 days?
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="bg-white border-t border-gray-200 p-4">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
