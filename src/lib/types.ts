export interface Document {
  id: string;
  filename: string;
  content: string;
  paragraphs: string[];
}

export interface SearchResult {
  document: Document;
  paragraph: string;
  paragraphIndex: number;
  score: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

export interface Citation {
  filename: string;
  paragraphIndex: number;
  text: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  content: string;
  citations: Citation[];
}
