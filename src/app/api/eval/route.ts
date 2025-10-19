import { NextRequest } from 'next/server';
import { DocumentRetriever } from '@/lib/retriever';
import { createLLMProvider } from '@/lib/llm';

const retriever = new DocumentRetriever();
const llmProvider = createLLMProvider();

// Test questions for evaluation
const testQuestions = [
  {
    id: 'pricing',
    question: 'What are the pricing tiers and what\'s included?',
    expectedSources: ['pricing.md'],
    description: 'Should find pricing information'
  },
  {
    id: 'getting-started',
    question: 'How do I get an API key to start?',
    expectedSources: ['getting-started.md'],
    description: 'Should find getting started information'
  },
  {
    id: 'refunds',
    question: 'Can I get a refund after 20 days?',
    expectedSources: ['refunds.md'],
    description: 'Should find refund policy information'
  },
  {
    id: 'general',
    question: 'What services do you offer?',
    expectedSources: ['pricing.md', 'getting-started.md'],
    description: 'Should find general service information'
  }
];

export async function GET(request: NextRequest) {
  try {
    const results = [];
    
    console.log('Starting evaluation with', testQuestions.length, 'test questions');
    
    for (const test of testQuestions) {
      console.log(`\n--- Testing: ${test.id} ---`);
      console.log(`Question: ${test.question}`);
      
      // Run retrieval
      const searchResults = retriever.search(test.question, 3);
      console.log(`Retrieved ${searchResults.length} results`);
      
      // Log sources found
      const sourcesFound = [...new Set(searchResults.map(r => r.document.filename))];
      console.log(`Sources found: ${sourcesFound.join(', ')}`);
      
      // Check if expected sources were found
      const expectedSourcesFound = test.expectedSources.filter(expected => 
        sourcesFound.includes(expected)
      );
      
      // Generate response (but don't stream it)
      const citations = searchResults.map(result => ({
        filename: result.document.filename,
        paragraphIndex: result.paragraphIndex,
        text: result.paragraph.substring(0, 150) + '...'
      }));

      // Create a simple response without streaming for evaluation
      let response = '';
      if (searchResults.length > 0) {
        const lowerQuery = test.question.toLowerCase();
        
        if (lowerQuery.includes('pricing') || lowerQuery.includes('price') || lowerQuery.includes('tier')) {
          response = 'Found pricing information with relevant tiers and features.';
        } else if (lowerQuery.includes('api key') || lowerQuery.includes('start')) {
          response = 'Found getting started information with API key instructions.';
        } else if (lowerQuery.includes('refund')) {
          response = 'Found refund policy information with eligibility details.';
        } else {
          response = 'Found relevant information in our documentation.';
        }
      } else {
        response = 'No relevant information found in knowledge base.';
      }
      
      const result = {
        id: test.id,
        question: test.question,
        description: test.description,
        expectedSources: test.expectedSources,
        sourcesFound: sourcesFound,
        expectedSourcesFound: expectedSourcesFound,
        retrievalScore: searchResults.length > 0 ? searchResults[0].score : 0,
        response: response,
        citations: citations,
        success: expectedSourcesFound.length > 0,
        timestamp: new Date().toISOString()
      };
      
      results.push(result);
      
      console.log(`Result: ${result.success ? 'PASS' : 'FAIL'}`);
      console.log(`Expected: ${test.expectedSources.join(', ')}`);
      console.log(`Found: ${sourcesFound.join(', ')}`);
    }
    
    // Calculate overall metrics
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const successRate = (passedTests / totalTests) * 100;
    
    const summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: Math.round(successRate * 100) / 100,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n--- Evaluation Summary ---');
    console.log(`Total tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passedTests}`);
    console.log(`Failed: ${summary.failedTests}`);
    console.log(`Success rate: ${summary.successRate}%`);
    
    return Response.json({
      summary,
      results,
      message: `Evaluation completed: ${passedTests}/${totalTests} tests passed (${successRate}%)`
    });

  } catch (error) {
    console.error('Evaluation error:', error);
    return Response.json({ 
      error: 'Evaluation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
