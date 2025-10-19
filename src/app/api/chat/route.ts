import { NextRequest } from 'next/server';
import { DocumentRetriever } from '@/lib/retriever';
import { createLLMProvider } from '@/lib/llm';
import { ChatRequest, ChatMessage, Citation } from '@/lib/types';

const retriever = new DocumentRetriever();
const llmProvider = createLLMProvider();

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return new Response('No messages provided', { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return new Response('Last message must be from user', { status: 400 });
    }

    // Retrieve relevant documents
    const searchResults = retriever.search(lastMessage.content, 3);
    
    // Generate citations
    const citations: Citation[] = searchResults.map(result => ({
      filename: result.document.filename,
      paragraphIndex: result.paragraphIndex,
      text: result.paragraph.substring(0, 150) + '...'
    }));

    // Generate response using LLM
    const responseStream = await llmProvider.generateResponse(
      lastMessage.content,
      searchResults
    );

    // Create a readable stream that includes citations
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = responseStream.getReader();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Send citations as a special message
              const citationsData = {
                type: 'citations',
                citations: citations
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(citationsData)}\n\n`));
              break;
            }
            
            // Send the content chunk
            const contentData = {
              type: 'content',
              content: value
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentData)}\n\n`));
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
