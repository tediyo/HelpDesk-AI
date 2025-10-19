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
    
    // Prompt guardrails - check for out-of-scope questions
    const outOfScopeKeywords = [
      'hardware', 'shipping', 'delivery', 'physical', 'device', 'computer', 'laptop',
      'weather', 'sports', 'politics', 'news', 'entertainment', 'cooking', 'travel'
    ];
    
    const isOutOfScope = outOfScopeKeywords.some(keyword => lowerQuery.includes(keyword));
    if (isOutOfScope) {
      return `I can only help with questions about our software service, including pricing, getting started, and refunds. For questions about ${outOfScopeKeywords.find(k => lowerQuery.includes(k))}, I'd recommend checking our documentation or contacting support.`;
    }
    
    // Check if we have context and if it's relevant
    if (context.length > 0) {
      // Check if any context has a meaningful score (not just fallback)
      const hasRelevantContext = context.some(result => result.score > 0.1);
      
      if (!hasRelevantContext) {
        // Context exists but is not relevant - prompt guardrails
        return `I don't have specific information about that topic in our knowledge base. I'd recommend checking our documentation (getting-started.md, pricing.md, or refunds.md) or contacting support for more detailed assistance.`;
      }
      // Check if query is about pricing
      if (lowerQuery.includes('pricing') || lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('plan') || lowerQuery.includes('tier')) {
        const pricingContext = context.find(r => r.document.filename === 'pricing.md');
        if (pricingContext) {
          return `Based on our pricing information, we offer three tiers: Free ($0/month), Professional ($29/month), and Enterprise ($99/month). The Free tier includes 100 API calls, Professional offers 10,000 calls with priority support, and Enterprise provides unlimited calls with 24/7 support. Each tier includes different features and support levels.`;
        }
      }
      
      // Check if query is about refunds
      if (lowerQuery.includes('refund') || lowerQuery.includes('cancel') || lowerQuery.includes('money back') || lowerQuery.includes('guarantee')) {
        const refundContext = context.find(r => r.document.filename === 'refunds.md');
        if (refundContext) {
          return `We offer a 30-day money-back guarantee for all paid plans. You can get a full refund within 30 days of your initial purchase with no questions asked. For service issues, we also provide refunds for outages lasting more than 24 hours. You can contact our billing team at billing@helpdesk-ai.com for refund requests.`;
        }
      }
      
      // Check if query is about getting started
      if (lowerQuery.includes('start') || lowerQuery.includes('begin') || lowerQuery.includes('api key') || lowerQuery.includes('getting started') || lowerQuery.includes('account') || lowerQuery.includes('signup')) {
        const startContext = context.find(r => r.document.filename === 'getting-started.md');
        if (startContext) {
          return `To get started, first create your account and verify your email. Then navigate to the API Keys section in your dashboard to generate your API key. Make sure to keep your API key secure and never share it publicly. You can then make your first API call using the provided curl example or our interactive API explorer.`;
        }
      }
      
      // Generic response using the retrieved context
      const contextSummary = context.map(result => {
        const filename = result.document.filename.replace('.md', '');
        const snippet = result.paragraph.substring(0, 200) + '...';
        return `From ${filename}: ${snippet}`;
      }).join('\n\n');
      
      return `I found some relevant information in our documentation that might help answer your question:\n\n${contextSummary}\n\nPlease let me know if you need more specific details about any of these topics.`;
    }
    
    // No relevant context found - prompt guardrails
    return `I don't have specific information about that topic in our knowledge base. I'd recommend checking our documentation (getting-started.md, pricing.md, or refunds.md) or contacting support for more detailed assistance.`;
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
