// Test the retriever independently
const fs = require('fs');
const path = require('path');

// Test document loading
const dataDir = path.join(process.cwd(), 'data');
console.log('Data directory:', dataDir);

try {
  const files = fs.readdirSync(dataDir);
  console.log('Files in data directory:', files);
  
  const mdFiles = files.filter(file => file.endsWith('.md'));
  console.log('Markdown files:', mdFiles);
  
  if (mdFiles.length > 0) {
    const content = fs.readFileSync(path.join(dataDir, mdFiles[0]), 'utf-8');
    console.log('First file content preview:', content.substring(0, 200));
    
    const paragraphs = content
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    console.log('Paragraphs found:', paragraphs.length);
    console.log('First paragraph:', paragraphs[0]);
  }
} catch (error) {
  console.error('Error:', error);
}
