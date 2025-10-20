# HelpDesk AI

A Next.js 14 application that provides AI-powered helpdesk functionality with Retrieval-Augmented Generation (RAG) capabilities. The application can answer questions about service documentation with streaming responses and source citations.

## Features

- **Clean Chat UI**: Modern, responsive chat interface built with Tailwind CSS
- **Streaming Responses**: Real-time streaming of AI responses for better UX
- **RAG Pipeline**: Keyword-based BM25 retrieval system for relevant document search
- **Source Citations**: Clickable citations showing which documents were used
- **TypeScript**: Full type safety throughout the application
- **Mock LLM**: Works without API keys using a built-in mock LLM provider

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Custom RAG System** with BM25 scoring
- **Server-Sent Events** for streaming

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd helpdesk-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
# Create .env.local file
echo "OPENAI_API_KEY=your_api_key_here" > .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Add your OpenAI API key for real LLM responses
OPENAI_API_KEY=your_api_key_here
```

If no API key is provided, the application will use a mock LLM provider that still demonstrates the full RAG pipeline.

## Project Structure

```
helpdesk-ai/
├── data/                          # Knowledge base documents
│   ├── pricing.md
│   ├── refunds.md
│   └── getting-started.md
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/chat/route.ts     # Chat API endpoint
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                # React components
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   └── lib/                       # Core logic
│       ├── retriever.ts          # RAG retrieval system
│       ├── llm.ts               # LLM provider abstraction
│       └── types.ts             # TypeScript type definitions
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Design Choices

### RAG Implementation
- **BM25 Scoring**: Chose keyword-based BM25 over embeddings for simplicity and speed
- **Paragraph-level Retrieval**: Documents are split into paragraphs for more precise retrieval
- **In-memory Indexing**: Simple file-based document loading for this demo

### LLM Provider
- **Abstraction Layer**: Easy to swap between mock and real providers
- **Streaming Support**: Both providers support streaming responses
- **Fallback**: Graceful fallback to mock when no API key is provided

### UI/UX
- **Streaming Indicators**: Visual feedback during response generation
- **Citation Display**: Clear source attribution with clickable chips
- **Sample Questions**: Pre-built prompts to help users get started

## API Endpoints

### POST /api/chat

Send a chat message and receive a streaming response.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What are the pricing tiers?"
    }
  ]
}
```

**Response:**
Server-Sent Events stream with content chunks and citations.

## Testing

Try these sample questions to test the RAG system:

1. "What are the pricing tiers and what's included?" → Should cite pricing.md
2. "How do I get an API key to start?" → Should cite getting-started.md  
3. "Can I get a refund after 20 days?" → Should cite refunds.md
4. "Do you ship hardware devices?" → Should refuse and suggest reading docs

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Documents

1. Add markdown files to the `/data` directory
2. The retriever will automatically index them on startup
3. No additional configuration needed

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
``````


