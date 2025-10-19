// Test script to check Teddy.md retrieval
const { DocumentRetriever } = require('./src/lib/retriever');

const retriever = new DocumentRetriever();

console.log('Testing Teddy.md retrieval...');
console.log('Available documents:', retriever.getFilenames());

// Test different queries
const queries = [
  'smart worker',
  'Teddyy',
  'Teddy',
  'worker',
  'smart'
];

queries.forEach(query => {
  console.log(`\n--- Testing: "${query}" ---`);
  const results = retriever.search(query, 3);
  console.log(`Found ${results.length} results`);
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.document.filename} (score: ${result.score})`);
    console.log(`   Content: ${result.paragraph.substring(0, 100)}...`);
  });
});
