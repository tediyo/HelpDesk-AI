import { NextRequest } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    
    // Get list of all files in data directory
    const allFiles = await readdir(dataDir);
    const markdownFiles = allFiles.filter(file => file.endsWith('.md') || file.endsWith('.txt'));

    return Response.json({
      files: markdownFiles,
      count: markdownFiles.length
    });

  } catch (error) {
    console.error('Files listing error:', error);
    return Response.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
