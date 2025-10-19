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
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.md'));
    
    this.documents = files.map(file => {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
      const paragraphs = content
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      return {
        id: file.replace('.md', ''),
        filename: file,
        content,
        paragraphs
      };
    });
    
    this.isIndexed = true;
  }

  search(query: string, topK: number = 3): SearchResult[] {
    if (!this.isIndexed) {
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

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
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

    // Calculate BM25 score
    const k1 = 1.2;
    const b = 0.75;
    const avgDocLength = allParagraphs.reduce((sum, p) => sum + this.tokenize(p).length, 0) / allParagraphs.length;
    const docLength = paragraphTerms.length;
    
    let score = 0;
    for (const term of queryTerms) {
      const tf = termFreq[term] || 0;
      if (tf === 0) continue;

      const idf = Math.log((allParagraphs.length + 1) / (this.countDocumentsWithTerm(term, allParagraphs) + 1));
      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
      
      score += idf * (numerator / denominator);
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
}
