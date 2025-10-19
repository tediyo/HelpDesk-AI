// Test script to debug the HelpDesk AI
const testRetriever = () => {
  console.log('Testing retriever...');
  
  // Test if we can read the data directory
  const fs = require('fs');
  const path = require('path');
  
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
    }
  } catch (error) {
    console.error('Error reading data directory:', error);
  }
};

testRetriever();
