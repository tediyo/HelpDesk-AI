# HelpDesk AI - File Structure Tree

## Complete Project Structure

```
helpdesk-ai/
├── 📁 data/                          # Knowledge base documents
│   ├── 📄 getting-started.md         # User onboarding guide
│   ├── 📄 pricing.md                 # Pricing plans and tiers
│   ├── 📄 refunds.md                 # Refund policy information
│   ├── 📄 Munichen.md                # Additional content
│   └── 📄 Teddy.md                   # Additional content
│
├── 📁 src/                           # Source code
│   ├── 📁 app/                       # Next.js App Router
│   │   ├── 📁 admin/                 # Admin panel pages
│   │   │   └── 📄 page.tsx           # Admin dashboard
│   │   │
│   │   ├── 📁 analytics/             # Analytics pages
│   │   │   └── 📄 page.tsx           # Rate limit analytics dashboard
│   │   │
│   │   ├── 📁 safety/                # Safety monitoring pages
│   │   │   └── 📄 page.tsx           # Safety dashboard
│   │   │
│   │   ├── 📁 api/                   # API routes
│   │   │   ├── 📁 admin/             # Admin API endpoints
│   │   │   │   ├── 📁 files/
│   │   │   │   │   └── 📄 route.ts   # File listing endpoint
│   │   │   │   ├── 📁 reindex/
│   │   │   │   │   └── 📄 route.ts   # Document reindexing endpoint
│   │   │   │   └── 📁 upload/
│   │   │   │       └── 📄 route.ts   # File upload endpoint
│   │   │   │
│   │   │   ├── 📁 analytics/         # Analytics API endpoints
│   │   │   │   ├── 📁 rate-limits/
│   │   │   │   │   └── 📄 route.ts   # Rate limit analytics
│   │   │   │   └── 📁 safety/
│   │   │   │       └── 📄 route.ts   # Safety analytics
│   │   │   │
│   │   │   ├── 📁 chat/
│   │   │   │   └── 📄 route.ts       # Main chat API endpoint
│   │   │   │
│   │   │   └── 📁 eval/
│   │   │       └── 📄 route.ts       # System evaluation endpoint
│   │   │
│   │   ├── 📄 globals.css            # Global styles
│   │   ├── 📄 layout.tsx             # Root layout component
│   │   └── 📄 page.tsx               # Home page (chat interface)
│   │
│   ├── 📁 components/                # Reusable React components
│   │   ├── 📄 ChatInterface.tsx      # Main chat container
│   │   ├── 📄 ChatMessage.tsx        # Individual message component
│   │   ├── 📄 ChatInput.tsx          # Message input form
│   │   ├── 📄 Footer.tsx             # Site footer
│   │   └── 📄 ThemeToggle.tsx        # Dark/light mode toggle
│   │
│   ├── 📁 contexts/                  # React context providers
│   │   └── 📄 ThemeContext.tsx       # Theme management context
│   │
│   ├── 📁 lib/                       # Core business logic and utilities
│   │   ├── 📄 types.ts               # TypeScript type definitions
│   │   ├── 📄 retriever.ts           # RAG document retrieval system
│   │   ├── 📄 llm.ts                 # LLM provider abstraction
│   │   ├── 📄 safety.ts              # Safety and content filtering
│   │   └── 📄 rateLimiter.ts         # Rate limiting system
│   │
│   └── 📁 __tests__/                 # Test files
│       └── 📄 retriever.test.ts      # Retriever system tests
│
├── 📁 node_modules/                  # Dependencies (auto-generated)
│
├── 📄 package.json                   # Project configuration
├── 📄 package-lock.json              # Dependency lock file
├── 📄 next.config.js                 # Next.js configuration
├── 📄 next-env.d.ts                  # Next.js TypeScript definitions
├── 📄 tailwind.config.js             # Tailwind CSS configuration
├── 📄 postcss.config.js              # PostCSS configuration
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 jest.config.js                 # Jest testing configuration
├── 📄 README.md                      # Project documentation
├── 📄 file-structure.md              # Comprehensive file structure docs
├── 📄 file-structure-tree.md         # This tree format file
├── 📄 test-api.js                    # API testing script
├── 📄 test-debug.js                  # Debug testing script
└── 📄 test-retriever.js              # Retriever testing script
```

## Simplified Tree (Without Descriptions)

```
helpdesk-ai/
├── data/
│   ├── getting-started.md
│   ├── pricing.md
│   ├── refunds.md
│   ├── Munichen.md
│   └── Teddy.md
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── safety/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── files/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── reindex/
│   │   │   │   │   └── route.ts
│   │   │   │   └── upload/
│   │   │   │       └── route.ts
│   │   │   ├── analytics/
│   │   │   │   ├── rate-limits/
│   │   │   │   │   └── route.ts
│   │   │   │   └── safety/
│   │   │   │       └── route.ts
│   │   │   ├── chat/
│   │   │   │   └── route.ts
│   │   │   └── eval/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── Footer.tsx
│   │   └── ThemeToggle.tsx
│   ├── contexts/
│   │   └── ThemeContext.tsx
│   ├── lib/
│   │   ├── types.ts
│   │   ├── retriever.ts
│   │   ├── llm.ts
│   │   ├── safety.ts
│   │   └── rateLimiter.ts
│   └── __tests__/
│       └── retriever.test.ts
├── node_modules/
├── package.json
├── package-lock.json
├── next.config.js
├── next-env.d.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── jest.config.js
├── README.md
├── file-structure.md
├── file-structure-tree.md
├── test-api.js
├── test-debug.js
└── test-retriever.js
```

## Key Directories Summary

```
📁 data/                    # Knowledge base (5 files)
📁 src/
  📁 app/                   # Next.js pages & API routes
    📁 admin/               # Admin dashboard (1 page)
    📁 analytics/           # Analytics dashboard (1 page)  
    📁 safety/              # Safety dashboard (1 page)
    📁 api/                 # API endpoints (7 routes)
    📄 layout.tsx           # Root layout
    📄 page.tsx             # Home page
  📁 components/            # React components (5 files)
  📁 contexts/              # Context providers (1 file)
  📁 lib/                   # Core utilities (5 files)
  📁 __tests__/             # Tests (1 file)
📁 node_modules/            # Dependencies
📄 Configuration files      # 6 config files
📄 Documentation files      # 3 docs + README
📄 Test scripts            # 3 test files
```

## File Count Summary

- **Total Files**: 33 files
- **Source Code**: 20 files
- **Configuration**: 6 files  
- **Documentation**: 4 files
- **Test Files**: 3 files
- **Dependencies**: node_modules/ (auto-generated)

## 🔬 Evaluation System

The project includes a comprehensive evaluation system for testing and monitoring:

### Admin Panel Evaluation Features
- **Run Evaluation Button**: Triggers comprehensive system testing
- **Real-time Results**: Live display of evaluation metrics
- **Export Functionality**: Download evaluation reports as JSON
- **Detailed Analytics**: Performance breakdown by category and difficulty
- **Visual Dashboards**: Charts and metrics for test results

### Evaluation API (`/api/eval`)
- **6 Test Categories**: pricing, getting-started, refunds, general, complex, edge-case
- **Performance Metrics**: Response time, confidence scores, source relevance
- **Automated Testing**: Runs predefined test questions
- **Comprehensive Reporting**: Success rates, category breakdowns, best/worst tests

### Test Scripts
- **`test-api.js`**: API endpoint testing with streaming
- **`test-debug.js`**: Data directory and file system testing  
- **`test-retriever.js`**: Document retrieval system testing

## File Types Breakdown

```
📄 TypeScript (.tsx/.ts):   18 files
📄 Markdown (.md):           5 files
📄 JavaScript (.js):         4 files
📄 JSON (.json):             2 files
📄 CSS (.css):               1 file
📄 Config files:             3 files
```
