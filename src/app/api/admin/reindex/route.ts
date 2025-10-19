import { NextRequest } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';
import { DocumentRetriever } from '@/lib/retriever';

// Global retriever instance (same as in chat route)
let globalRetriever: DocumentRetriever | null = null;

function getRetriever(): DocumentRetriever {
  if (!globalRetriever) {
    globalRetriever = new DocumentRetriever();
  }
  return globalRetriever;
}

export async function POST(request: NextRequest) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    
    // Get list of all files in data directory
    const allFiles = await readdir(dataDir);
    const markdownFiles = allFiles.filter(file => file.endsWith('.md') || file.endsWith('.txt'));

    // Re-index the retriever
    const retriever = getRetriever();
    retriever.reindex();

    return Response.json({
      files: markdownFiles,
      documentCount: markdownFiles.length,
      message: `Re-indexed ${markdownFiles.length} documents`
    });

  } catch (error) {
    console.error('Re-index error:', error);
    return Response.json({ error: 'Re-indexing failed' }, { status: 500 });
  }
}
