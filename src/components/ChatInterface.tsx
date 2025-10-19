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
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
              {/* Header with admin and analytics links */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-800">HelpDesk AI</h1>
                <div className="flex gap-4">
                  <a 
                    href="/analytics" 
                    className="text-sm text-purple-600 hover:text-purple-800 underline"
                  >
                    📊 Analytics
                  </a>
                  <a 
                    href="/admin" 
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Admin Panel
                  </a>
                </div>
              </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-4">Ask me anything about our service, pricing, refunds, or getting started!</p>
            <div className="mt-6 space-y-2">
              <p className="text-sm">Try asking:</p>
              <div className="space-y-1">
                <button
                  onClick={() => handleSendMessage('What are the pricing tiers and what\'s included?')}
                  className="block w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  What are the pricing tiers and what's included?
                </button>
                <button
                  onClick={() => handleSendMessage('How do I get an API key to start?')}
                  className="block w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  How do I get an API key to start?
                </button>
                <button
                  onClick={() => handleSendMessage('Can I get a refund after 20 days?')}
                  className="block w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  Can I get a refund after 20 days?
                </button>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
