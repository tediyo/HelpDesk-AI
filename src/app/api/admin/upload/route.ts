import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return Response.json({ error: 'No files provided' }, { status: 400 });
    }

    const dataDir = path.join(process.cwd(), 'data');
    
    // Ensure data directory exists
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    const uploadedFiles: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Validate file type
        if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
          errors.push(`${file.name}: Only .md and .txt files are allowed`);
          continue;
        }

        // Validate file size (max 1MB)
        if (file.size > 1024 * 1024) {
          errors.push(`${file.name}: File too large (max 1MB)`);
          continue;
        }

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(dataDir, file.name);
        
        await writeFile(filePath, buffer);
        uploadedFiles.push(file.name);
      } catch (error) {
        errors.push(`${file.name}: ${error}`);
      }
    }

    // Get list of all files in data directory
    const { readdir } = await import('fs/promises');
    const allFiles = await readdir(dataDir);
    const markdownFiles = allFiles.filter(file => file.endsWith('.md') || file.endsWith('.txt'));

    return Response.json({
      uploadedFiles,
      errors,
      existingFiles: markdownFiles,
      message: `Uploaded ${uploadedFiles.length} files successfully${errors.length > 0 ? `, ${errors.length} errors` : ''}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
