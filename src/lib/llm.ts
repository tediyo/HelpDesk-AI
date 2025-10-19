import { SearchResult, Citation } from './types';

export interface LLMProvider {
  generateResponse(query: string, context: SearchResult[]): Promise<ReadableStream<string>>;
}

export class MockLLMProvider implements LLMProvider {
  async generateResponse(query: string, context: SearchResult[]): Promise<ReadableStream<string>> {
    const citations: Citation[] = context.map(result => ({
      filename: result.document.filename,
      paragraphIndex: result.paragraphIndex,
      text: result.paragraph.substring(0, 100) + '...'
    }));

    const response = this.buildResponse(query, context, citations);
    
    // Simulate streaming by chunking the response
    return new ReadableStream({
      start(controller) {
        const words = response.split(' ');
        let index = 0;
        
        const sendChunk = () => {
          if (index < words.length) {
            const chunk = words[index] + (index < words.length - 1 ? ' ' : '');
            controller.enqueue(chunk);
            index++;
            setTimeout(sendChunk, 50); // Simulate streaming delay
          } else {
            controller.close();
          }
        };
        
        sendChunk();
      }
    });
  }

  private buildResponse(query: string, context: SearchResult[], citations: Citation[]): string {
    const lowerQuery = query.toLowerCase();
    
    // Check if query is about pricing
    if (lowerQuery.includes('pricing') || lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('plan')) {
      const pricingContext = context.find(r => r.document.filename === 'pricing.md');
      if (pricingContext) {
        return `Based on our pricing information, we offer three tiers: Free ($0/month), Professional ($29/month), and Enterprise ($99/month). The Free tier includes 100 API calls, Professional offers 10,000 calls with priority support, and Enterprise provides unlimited calls with 24/7 support. Each tier includes different features and support levels.`;
      }
    }
    
    // Check if query is about refunds
    if (lowerQuery.includes('refund') || lowerQuery.includes('cancel') || lowerQuery.includes('money back')) {
      const refundContext = context.find(r => r.document.filename === 'refunds.md');
      if (refundContext) {
        return `We offer a 30-day money-back guarantee for all paid plans. You can get a full refund within 30 days of your initial purchase with no questions asked. For service issues, we also provide refunds for outages lasting more than 24 hours. You can contact our billing team at billing@helpdesk-ai.com for refund requests.`;
      }
    }
    
    // Check if query is about getting started
    if (lowerQuery.includes('start') || lowerQuery.includes('begin') || lowerQuery.includes('api key') || lowerQuery.includes('getting started')) {
      const startContext = context.find(r => r.document.filename === 'getting-started.md');
      if (startContext) {
        return `To get started, first create your account and verify your email. Then navigate to the API Keys section in your dashboard to generate your API key. Make sure to keep your API key secure and never share it publicly. You can then make your first API call using the provided curl example or our interactive API explorer.`;
      }
    }
    
    // Generic response if no specific context found
    if (context.length > 0) {
      return `I found some relevant information that might help answer your question. Let me provide you with the details from our documentation.`;
    }
    
    // No relevant context found
    return `I don't have specific information about that topic in our knowledge base. I'd recommend checking our documentation or contacting support for more detailed assistance.`;
  }
}

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateResponse(query: string, context: SearchResult[]): Promise<ReadableStream<string>> {
    const contextText = context.map(result => 
      `From ${result.document.filename}:\n${result.paragraph}`
    ).join('\n\n');

    const systemPrompt = `You are a helpful support assistant. Answer questions based on the provided context. Always cite your sources when possible. If you cannot find relevant information in the context, say so clearly.

Context:
${contextText}

Question: ${query}

Answer:`;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    return response.body!;
  }
}

export function createLLMProvider(): LLMProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (apiKey) {
    return new OpenAIProvider(apiKey);
  }
  
  return new MockLLMProvider();
}
