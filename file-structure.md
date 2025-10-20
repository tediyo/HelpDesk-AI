# HelpDesk AI - Comprehensive File Structure Documentation

## Project Overview
HelpDesk AI is a Next.js 14 application that provides AI-powered helpdesk functionality with Retrieval-Augmented Generation (RAG) capabilities. The application features a modern chat interface, streaming responses, source citations, and comprehensive admin/analytics dashboards.

## Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **RAG System**: Custom BM25-based retrieval
- **LLM**: OpenAI API with mock fallback
- **Testing**: Jest
- **Deployment**: Node.js

---

## 📁 Root Directory Structure

```
helpdesk-ai/
├── 📁 data/                          # Knowledge base documents
├── 📁 src/                           # Source code
├── 📁 node_modules/                  # Dependencies
├── 📄 package.json                   # Project configuration
├── 📄 package-lock.json              # Dependency lock file
├── 📄 next.config.js                 # Next.js configuration
├── 📄 next-env.d.ts                  # Next.js TypeScript definitions
├── 📄 tailwind.config.js             # Tailwind CSS configuration
├── 📄 postcss.config.js              # PostCSS configuration
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 jest.config.js                 # Jest testing configuration
├── 📄 README.md                      # Project documentation
├── 📄 test-api.js                    # API testing script
├── 📄 test-debug.js                  # Debug testing script
└── 📄 test-retriever.js              # Retriever testing script
```

---

## 📁 Data Directory (`/data/`)

Contains the knowledge base documents used by the RAG system.

```
data/
├── 📄 getting-started.md             # User onboarding guide
├── 📄 pricing.md                     # Pricing plans and tiers
├── 📄 refunds.md                     # Refund policy information
├── 📄 Munichen.md                    # Additional content
└── 📄 Teddy.md                       # Additional content
```

**Purpose**: These markdown files serve as the knowledge base for the AI system. The retriever automatically indexes these documents and uses them to answer user queries.

---

## 📁 Source Code Directory (`/src/`)

### 📁 App Directory (`/src/app/`)

Next.js 14 App Router structure containing pages and API routes.

```
src/app/
├── 📁 admin/                         # Admin panel pages
│   └── 📄 page.tsx                   # Admin dashboard
├── 📁 analytics/                     # Analytics pages
│   └── 📄 page.tsx                   # Rate limit analytics dashboard
├── 📁 safety/                        # Safety monitoring pages
│   └── 📄 page.tsx                   # Safety dashboard
├── 📁 api/                           # API routes
│   ├── 📁 admin/                     # Admin API endpoints
│   │   ├── 📁 files/
│   │   │   └── 📄 route.ts           # File listing endpoint
│   │   ├── 📁 reindex/
│   │   │   └── 📄 route.ts           # Document reindexing endpoint
│   │   └── 📁 upload/
│   │       └── 📄 route.ts           # File upload endpoint
│   ├── 📁 analytics/                 # Analytics API endpoints
│   │   ├── 📁 rate-limits/
│   │   │   └── 📄 route.ts           # Rate limit analytics
│   │   └── 📁 safety/
│   │       └── 📄 route.ts           # Safety analytics
│   ├── 📁 chat/
│   │   └── 📄 route.ts               # Main chat API endpoint
│   └── 📁 eval/
│       └── 📄 route.ts               # System evaluation endpoint
├── 📄 globals.css                    # Global styles
├── 📄 layout.tsx                     # Root layout component
└── 📄 page.tsx                       # Home page (chat interface)
```

#### Key App Files:

**`layout.tsx`** - Root layout with theme provider
- Sets up Inter font
- Provides theme context
- Handles hydration warnings

**`page.tsx`** - Main chat interface
- Renders ChatInterface component
- Includes Footer component
- Full-screen layout

**`globals.css`** - Global styles
- Tailwind CSS imports
- Custom CSS variables
- Dark mode support

### 📁 Components Directory (`/src/components/`)

Reusable React components for the UI.

```
src/components/
├── 📄 ChatInterface.tsx              # Main chat container
├── 📄 ChatMessage.tsx                # Individual message component
├── 📄 ChatInput.tsx                  # Message input form
├── 📄 Footer.tsx                     # Site footer
└── 📄 ThemeToggle.tsx                # Dark/light mode toggle
```

#### Component Details:

**`ChatInterface.tsx`** - Main chat component
- Manages chat state and messages
- Handles API communication
- Implements streaming responses
- Includes safety and rate limiting
- Provides sample questions
- Responsive design

**`ChatMessage.tsx`** - Message display component
- Renders user and assistant messages
- Shows citations and sources
- Displays safety information
- Handles timestamps
- Responsive styling

**`ChatInput.tsx`** - Input form component
- Textarea with auto-resize
- Enter/Shift+Enter handling
- Disabled state management
- Responsive design

**`Footer.tsx`** - Site footer
- Simple footer with attribution
- Responsive design

**`ThemeToggle.tsx`** - Theme switcher
- Dark/light mode toggle
- Smooth transitions
- Hydration-safe rendering

### 📁 Contexts Directory (`/src/contexts/`)

React context providers for global state management.

```
src/contexts/
└── 📄 ThemeContext.tsx               # Theme management context
```

**`ThemeContext.tsx`** - Theme management
- Provides theme state (light/dark)
- Handles localStorage persistence
- System preference detection
- Hydration-safe implementation

### 📁 Library Directory (`/src/lib/`)

Core business logic and utilities.

```
src/lib/
├── 📄 types.ts                       # TypeScript type definitions
├── 📄 retriever.ts                   # RAG document retrieval system
├── 📄 llm.ts                         # LLM provider abstraction
├── 📄 safety.ts                      # Safety and content filtering
└── 📄 rateLimiter.ts                 # Rate limiting system
```

#### Library Files Details:

**`types.ts`** - Type definitions
- `Document` - Document structure
- `SearchResult` - Search result format
- `ChatMessage` - Message interface
- `Citation` - Source citation format
- `ChatRequest/Response` - API interfaces

**`retriever.ts`** - Document retrieval system
- `DocumentRetriever` class
- BM25 scoring algorithm
- Document indexing
- Paragraph-level search
- Fallback mechanisms

**`llm.ts`** - LLM provider abstraction
- `LLMProvider` interface
- `MockLLMProvider` - Local mock implementation
- `OpenAIProvider` - OpenAI API integration
- Streaming response support
- Context-aware responses

**`safety.ts`** - Safety and content filtering
- `SafetyGuard` class
- Pattern-based filtering
- Context-aware rules
- Risk level assessment
- Analytics and reporting

**`rateLimiter.ts`** - Rate limiting system
- `RateLimiter` class
- IP-based limiting
- Usage analytics
- System health monitoring
- Cleanup mechanisms

### 📁 Tests Directory (`/src/__tests__/`)

Test files for the application.

```
src/__tests__/
└── 📄 retriever.test.ts              # Retriever system tests
```

---

## 🔧 Configuration Files

### `package.json`
- Project metadata and dependencies
- Scripts for development, build, and testing
- Next.js 14, React 18, TypeScript 5
- Tailwind CSS, Jest testing framework

### `next.config.js`
- Next.js configuration
- App Router settings
- Build optimizations

### `tailwind.config.js`
- Tailwind CSS configuration
- Custom theme settings
- Dark mode support

### `tsconfig.json`
- TypeScript configuration
- Path mapping for imports
- Compiler options

### `jest.config.js`
- Jest testing configuration
- TypeScript support
- Test environment setup

---

## 🚀 API Endpoints

### Chat API (`/api/chat`)
- **Method**: POST
- **Purpose**: Main chat endpoint
- **Features**: 
  - Rate limiting (10 requests/minute)
  - Safety scanning
  - RAG retrieval
  - Streaming responses
  - Citation generation

### Admin APIs (`/api/admin/`)
- **`/files`** - List knowledge base files
- **`/upload`** - Upload new documents
- **`/reindex`** - Reindex documents

### Analytics APIs (`/api/analytics/`)
- **`/rate-limits`** - Rate limiting analytics
- **`/safety`** - Safety metrics and reports

### Evaluation API (`/api/eval`)
- **Purpose**: Comprehensive system performance evaluation
- **Features**: 
  - 6 predefined test categories (pricing, getting-started, refunds, general, complex, edge-case)
  - Automated testing with 6 test questions
  - Performance metrics (response time, confidence scores, source relevance)
  - Category and difficulty breakdowns
  - Best/worst test identification
  - Detailed reporting and analytics

---

## 🎨 UI/UX Features

### Design System
- **Colors**: Blue/purple gradient theme
- **Typography**: Inter font family
- **Layout**: Responsive grid system
- **Components**: Consistent styling patterns

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

### Dark Mode
- System preference detection
- Manual toggle option
- Persistent user preference
- Smooth transitions

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

---

## 🔒 Security Features

### Rate Limiting
- IP-based request limiting
- Configurable thresholds
- Analytics and monitoring
- Graceful degradation

### Safety System
- Content filtering
- Prompt injection protection
- Context-aware validation
- Risk assessment scoring

### Data Protection
- No sensitive data storage
- Secure API communication
- Input validation
- Error handling

---

## 📊 Analytics & Monitoring

### Rate Limit Analytics
- Request tracking
- IP monitoring
- Performance metrics
- System health status

### Safety Analytics
- Threat detection
- Risk distribution
- Pattern analysis
- Recommendations

### System Evaluation
- Automated testing
- Performance benchmarking
- Quality metrics
- Detailed reporting

---

## 🧪 Testing

### Test Structure
- Jest testing framework
- TypeScript support
- Component testing
- API testing

### Test Files
- `retriever.test.ts` - Document retrieval tests
- Additional test scripts in root directory

---

## 📈 Performance Features

### RAG System
- BM25 scoring algorithm
- Paragraph-level retrieval
- Fallback mechanisms
- Caching strategies

### Streaming
- Real-time response generation
- Server-sent events
- Progressive loading
- Error handling

### Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle optimization

---

## 🚀 Deployment

### Build Process
- Next.js production build
- TypeScript compilation
- CSS optimization
- Asset optimization

### Environment Variables
- `OPENAI_API_KEY` - Optional OpenAI API key
- Fallback to mock LLM if not provided

### Production Considerations
- Rate limiting configuration
- Safety system tuning
- Performance monitoring
- Error tracking

---

## 📝 Development Workflow

### Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Code linting
- `npm test` - Run tests
- `npm run test:watch` - Watch mode testing

### Code Organization
- Feature-based structure
- Separation of concerns
- Reusable components
- Type safety throughout

---

## 🔄 Data Flow

1. **User Input** → ChatInput component
2. **Message Processing** → ChatInterface state management
3. **API Request** → /api/chat endpoint
4. **Rate Limiting** → RateLimiter validation
5. **Safety Check** → SafetyGuard scanning
6. **Document Retrieval** → DocumentRetriever search
7. **LLM Generation** → LLM provider response
8. **Streaming Response** → Real-time delivery
9. **UI Update** → ChatMessage rendering

---

This comprehensive file structure documentation provides a complete overview of the HelpDesk AI project, including all components, their purposes, and how they work together to create a robust AI-powered helpdesk system.
