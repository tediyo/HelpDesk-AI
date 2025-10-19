import { NextRequest } from 'next/server';
import { DocumentRetriever } from '@/lib/retriever';
import { createLLMProvider } from '@/lib/llm';
import { ChatRequest, ChatMessage, Citation } from '@/lib/types';
import { rateLimiter } from '@/lib/rateLimiter';
import { safetyGuard } from '@/lib/safety';

const retriever = new DocumentRetriever();
const llmProvider = createLLMProvider();

export async function POST(request: NextRequest) {
  try {
            // Rate limiting
            const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
            const userAgent = request.headers.get('user-agent') || 'unknown';
            const rateLimitResult = rateLimiter.isAllowed(clientIP, userAgent);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          resetTime: rateLimitResult.resetTime
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

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
            
            // Safety scan before processing
            const safetyResult = safetyGuard.scanQuery(lastMessage.content, searchResults);
            
            if (!safetyResult.isSafe) {
              console.log('Safety guard blocked query:', {
                query: lastMessage.content,
                reasons: safetyResult.reasons,
                riskLevel: safetyResult.riskLevel,
                confidence: safetyResult.confidence
              });
              
              const blockedResponse = {
                type: 'safety_blocked',
                message: 'I cannot process this request due to safety concerns.',
                reasons: safetyResult.reasons,
                suggestions: safetyResult.suggestions,
                riskLevel: safetyResult.riskLevel
              };
              
              return new Response(JSON.stringify(blockedResponse), {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'X-RateLimit-Limit': '10',
                  'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                  'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
                },
              });
            }
            
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

    // Create a readable stream that includes citations and safety info
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = responseStream.getReader();
        let fullResponse = '';
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Post-response safety scan
              const postSafetyResult = safetyGuard.scanQuery(
                lastMessage.content, 
                searchResults, 
                fullResponse
              );
              
              // Send safety info
              const safetyData = {
                type: 'safety_info',
                confidence: postSafetyResult.confidence,
                riskLevel: postSafetyResult.riskLevel,
                isSafe: postSafetyResult.isSafe
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(safetyData)}\n\n`));
              
              // Send citations
              const citationsData = {
                type: 'citations',
                citations: citations
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(citationsData)}\n\n`));
              
              // Send end signal
              const endData = {
                type: 'end',
                message: 'Stream completed'
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(endData)}\n\n`));
              
              // Close the stream
              controller.close();
              break;
            }
            
            // Accumulate response for post-scan
            fullResponse += value;
            
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
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
