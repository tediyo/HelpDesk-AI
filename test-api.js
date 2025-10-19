// Simple test script for the HelpDesk AI API
const testAPI = async () => {
  try {
    console.log('Testing HelpDesk AI API...');
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'What are the pricing tiers?'
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ API is responding!');
    console.log('Response status:', response.status);
    
    // Read the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    console.log('📡 Streaming response:');
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      console.log('Chunk:', chunk);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

// Run the test
testAPI();
