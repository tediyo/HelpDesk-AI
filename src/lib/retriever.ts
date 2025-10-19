import fs from 'fs';
import path from 'path';
import { Document, SearchResult } from './types';

export class DocumentRetriever {
  private documents: Document[] = [];
  private isIndexed = false;

  constructor() {
    this.loadDocuments();
  }

  private loadDocuments() {
    const dataDir = path.join(process.cwd(), 'data');
    try {
      const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.md'));
    
      this.documents = files.map(file => {
        const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
        // Split by double newlines, but also split by single newlines for better granularity
        const paragraphs = content
          .split(/\n\s*\n/)  // Split by double newlines
          .map(p => p.trim())
          .filter(p => p.length > 0)
          .flatMap(paragraph => {
            // Further split long paragraphs by single newlines
            if (paragraph.length > 300) {
              return paragraph.split('\n')
                .map(p => p.trim())
                .filter(p => p.length > 0);
            }
            return [paragraph];
          });
        
        console.log(`Retriever - Loaded ${file} with ${paragraphs.length} paragraphs`);
        
        return {
          id: file.replace('.md', ''),
          filename: file,
          content,
          paragraphs
        };
      });
      
      this.isIndexed = true;
    } catch (error) {
      console.error('Retriever - Error loading documents:', error);
      this.documents = [];
      this.isIndexed = false;
    }
  }

  search(query: string, topK: number = 3): SearchResult[] {
    if (!this.isIndexed) {
      console.log('Retriever - Not indexed yet');
      return [];
    }

    const queryTerms = this.tokenize(query.toLowerCase());
    const results: SearchResult[] = [];

    for (const doc of this.documents) {
      for (let i = 0; i < doc.paragraphs.length; i++) {
        const paragraph = doc.paragraphs[i];
        const score = this.calculateBM25Score(queryTerms, paragraph, doc.paragraphs);
        
        if (score > 0) {
          results.push({
            document: doc,
            paragraph,
            paragraphIndex: i,
            score
          });
        }
      }
    }

    let finalResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    
    // If no results found, return some paragraphs anyway for general queries
    if (finalResults.length === 0 && queryTerms.length > 0) {
      const fallbackResults: SearchResult[] = [];
      
      for (const doc of this.documents) {
        for (let i = 0; i < Math.min(doc.paragraphs.length, 2); i++) {
          fallbackResults.push({
            document: doc,
            paragraph: doc.paragraphs[i],
            paragraphIndex: i,
            score: 0.01 // Very low score for fallback
          });
        }
      }
      
      finalResults = fallbackResults.slice(0, topK);
    }
    
    console.log('Retriever - Found results:', finalResults.length);
    
    return finalResults;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 0);
  }

  private calculateBM25Score(queryTerms: string[], paragraph: string, allParagraphs: string[]): number {
    const paragraphTerms = this.tokenize(paragraph);
    const termFreq: { [key: string]: number } = {};
    
    // Count term frequencies in the paragraph
    for (const term of paragraphTerms) {
      termFreq[term] = (termFreq[term] || 0) + 1;
    }

    // Calculate BM25 score with more lenient matching
    const k1 = 1.2;
    const b = 0.75;
    const avgDocLength = allParagraphs.reduce((sum, p) => sum + this.tokenize(p).length, 0) / allParagraphs.length;
    const docLength = paragraphTerms.length;
    
    let score = 0;
    let matchedTerms = 0;
    
    for (const term of queryTerms) {
      const tf = termFreq[term] || 0;
      if (tf > 0) {
        matchedTerms++;
        const idf = Math.log((allParagraphs.length + 1) / (this.countDocumentsWithTerm(term, allParagraphs) + 1));
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
        
        score += idf * (numerator / denominator);
      }
    }
    
    // Add a bonus for partial matches
    const matchRatio = matchedTerms / queryTerms.length;
    if (matchRatio > 0) {
      score += matchRatio * 0.5; // Small bonus for partial matches
    }
    
    // Add a small score for any paragraph that contains any query term
    if (matchedTerms > 0) {
      score += 0.1;
    }

    return score;
  }

  private countDocumentsWithTerm(term: string, allParagraphs: string[]): number {
    return allParagraphs.filter(paragraph => 
      this.tokenize(paragraph.toLowerCase()).includes(term)
    ).length;
  }

  getDocument(filename: string): Document | undefined {
    return this.documents.find(doc => doc.filename === filename);
  }

  getAllDocuments(): Document[] {
    return this.documents;
  }

  // Method to re-index documents (useful for admin panel)
  reindex(): void {
    this.documents = [];
    this.isIndexed = false;
    this.loadDocuments();
  }

  // Method to get document count
  getDocumentCount(): number {
    return this.documents.length;
  }

  // Method to get list of filenames
  getFilenames(): string[] {
    return this.documents.map(doc => doc.filename);
  }
}
