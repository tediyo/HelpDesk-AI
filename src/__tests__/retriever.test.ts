import { DocumentRetriever } from '../lib/retriever';
import { Document } from '../lib/types';

// Mock the file system operations
jest.mock('fs', () => ({
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe('DocumentRetriever', () => {
  let retriever: DocumentRetriever;
  let mockDocuments: Document[];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock documents
    mockDocuments = [
      {
        id: 'pricing',
        filename: 'pricing.md',
        content: '# Pricing Plans\n\n## Free Tier\n- Cost: $0/month\n- Features: Basic support',
        paragraphs: [
          '# Pricing Plans',
          '## Free Tier\n- Cost: $0/month\n- Features: Basic support'
        ]
      },
      {
        id: 'refunds',
        filename: 'refunds.md',
        content: '# Refund Policy\n\n## 30-Day Guarantee\nWe offer refunds within 30 days',
        paragraphs: [
          '# Refund Policy',
          '## 30-Day Guarantee\nWe offer refunds within 30 days'
        ]
      }
    ];

    // Mock file system operations
    const fs = require('fs');
    fs.readdirSync.mockReturnValue(['pricing.md', 'refunds.md']);
    fs.readFileSync.mockImplementation((filePath: string) => {
      if (filePath.includes('pricing.md')) {
        return mockDocuments[0].content;
      } else if (filePath.includes('refunds.md')) {
        return mockDocuments[1].content;
      }
      return '';
    });

    retriever = new DocumentRetriever();
  });

  describe('Document Loading', () => {
    test('should load documents from file system', () => {
      expect(retriever.getDocumentCount()).toBe(2);
      expect(retriever.getFilenames()).toEqual(['pricing.md', 'refunds.md']);
    });

    test('should split content into paragraphs correctly', () => {
      const pricingDoc = retriever.getDocument('pricing.md');
      expect(pricingDoc?.paragraphs).toHaveLength(2);
      expect(pricingDoc?.paragraphs[0]).toBe('# Pricing Plans');
    });
  });

  describe('Search Functionality', () => {
    test('should find relevant documents for pricing queries', () => {
      const results = retriever.search('pricing plans cost', 3);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].document.filename).toBe('pricing.md');
      expect(results[0].score).toBeGreaterThan(0);
    });

    test('should find relevant documents for refund queries', () => {
      const results = retriever.search('refund policy 30 days', 3);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].document.filename).toBe('refunds.md');
      expect(results[0].score).toBeGreaterThan(0);
    });

    test('should return fallback results for irrelevant queries', () => {
      const results = retriever.search('completely unrelated topic', 3);
      
      // Our retriever returns fallback results for general queries
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBe(0.01); // Fallback score
    });

    test('should respect topK parameter', () => {
      const results = retriever.search('pricing', 1);
      
      expect(results.length).toBeLessThanOrEqual(1);
    });

    test('should return results sorted by score (highest first)', () => {
      const results = retriever.search('pricing cost', 3);
      
      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
        }
      }
    });
  });

  describe('BM25 Scoring', () => {
    test('should give higher scores to more relevant documents', () => {
      const pricingResults = retriever.search('pricing plans', 3);
      const refundResults = retriever.search('refund policy', 3);
      
      if (pricingResults.length > 0 && refundResults.length > 0) {
        const pricingScore = pricingResults.find(r => r.document.filename === 'pricing.md')?.score || 0;
        const refundScore = refundResults.find(r => r.document.filename === 'refunds.md')?.score || 0;
        
        expect(pricingScore).toBeGreaterThan(0);
        expect(refundScore).toBeGreaterThan(0);
      }
    });

    test('should handle empty queries gracefully', () => {
      const results = retriever.search('', 3);
      expect(results.length).toBe(0);
    });

    test('should handle queries with special characters', () => {
      const results = retriever.search('pricing & costs!', 3);
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Fallback Results', () => {
    test('should return fallback results for general queries', () => {
      const results = retriever.search('hello', 3);
      
      // Should return some results even for general queries
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBe(0.01); // Fallback score
    });
  });

  describe('Document Management', () => {
    test('should get specific document by filename', () => {
      const doc = retriever.getDocument('pricing.md');
      expect(doc).toBeDefined();
      expect(doc?.filename).toBe('pricing.md');
    });

    test('should return undefined for non-existent document', () => {
      const doc = retriever.getDocument('nonexistent.md');
      expect(doc).toBeUndefined();
    });

    test('should get all documents', () => {
      const docs = retriever.getAllDocuments();
      expect(docs).toHaveLength(2);
      expect(docs.map(d => d.filename)).toEqual(['pricing.md', 'refunds.md']);
    });
  });

  describe('Reindexing', () => {
    test('should reindex documents', () => {
      // Add a new document to the mock
      const fs = require('fs');
      fs.readdirSync.mockReturnValue(['pricing.md', 'refunds.md', 'new-doc.md']);
      fs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('new-doc.md')) {
          return '# New Document\n\nThis is a new document';
        }
        return mockDocuments.find(d => filePath.includes(d.filename))?.content || '';
      });

      retriever.reindex();
      
      expect(retriever.getDocumentCount()).toBe(3);
      expect(retriever.getFilenames()).toContain('new-doc.md');
    });
  });
});
