# HelpDesk AI - System Architecture Documentation

## 🏗️ Architecture Overview

HelpDesk AI is a modern, full-stack AI-powered helpdesk application built with Next.js 14, featuring a sophisticated RAG (Retrieval-Augmented Generation) system, real-time streaming responses, and comprehensive monitoring capabilities.

## 🎯 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Chat Interface│  │  Admin Panel    │  │  Analytics      │  │  Safety     │ │
│  │   (Main UI)     │  │  Dashboard      │  │  Dashboard      │  │  Dashboard  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                     │                     │               │         │
│           └─────────────────────┼─────────────────────┼───────────────┘         │
│                                 │                     │                         │
└─────────────────────────────────┼─────────────────────┼─────────────────────────┘
                                  │                     │
┌─────────────────────────────────┼─────────────────────┼─────────────────────────┐
│                           API GATEWAY LAYER                                     │
├─────────────────────────────────┼─────────────────────┼─────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   /api/chat     │  │  /api/admin/*   │  │ /api/analytics/*│  │  /api/eval  │ │
│  │   (Main Chat)   │  │  (Admin APIs)   │  │ (Analytics)     │  │ (Evaluation)│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                     │                     │               │         │
│           └─────────────────────┼─────────────────────┼───────────────┘         │
│                                 │                     │                         │
└─────────────────────────────────┼─────────────────────┼─────────────────────────┘
                                  │                     │
┌─────────────────────────────────┼─────────────────────┼─────────────────────────┐
│                           BUSINESS LOGIC LAYER                                  │
├─────────────────────────────────┼─────────────────────┼─────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Rate Limiter   │  │  Safety Guard   │  │  Document       │  │  LLM        │ │
│  │  (10 req/min)   │  │  (Content Filter)│  │  Retriever      │  │  Provider   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                     │                     │               │         │
│           └─────────────────────┼─────────────────────┼───────────────┘         │
│                                 │                     │                         │
└─────────────────────────────────┼─────────────────────┼─────────────────────────┘
                                  │                     │
┌─────────────────────────────────┼─────────────────────┼─────────────────────────┐
│                            DATA LAYER                                           │
├─────────────────────────────────┼─────────────────────┼─────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Knowledge Base │  │  File System    │  │  In-Memory      │  │  External   │ │
│  │  (Markdown Docs)│  │  (Upload/Index) │  │  Cache/Stats    │  │  APIs       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🧩 Component Architecture

### Frontend Architecture (Next.js 14 App Router)

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    APP ROUTER                              │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │    /        │ │   /admin    │ │ /analytics  │          │ │
│  │  │ (Chat UI)   │ │ (Admin)     │ │ (Analytics) │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  │  ┌─────────────┐ ┌─────────────┐                          │ │
│  │  │  /safety    │ │   /api/*    │                          │ │
│  │  │ (Safety)    │ │ (API Routes)│                          │ │
│  │  └─────────────┘ └─────────────┘                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  COMPONENT LAYER                           │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │ChatInterface│ │ChatMessage  │ │ ChatInput   │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │  Footer     │ │ThemeToggle  │ │ AdminPanel  │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  CONTEXT LAYER                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │              ThemeContext                              │ │ │
│  │  │        (Dark/Light Mode Management)                    │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Architecture (API Routes)

```
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    CHAT API                                │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │Rate Limiter │ │Safety Guard │ │Document     │          │ │
│  │  │(10 req/min) │ │(Content     │ │Retriever    │          │ │
│  │  │             │ │ Filter)     │ │(BM25)       │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  │           │             │             │                   │ │
│  │           └─────────────┼─────────────┘                   │ │
│  │                         │                                 │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │                LLM Provider                            │ │ │
│  │  │  ┌─────────────┐              ┌─────────────┐          │ │ │
│  │  │  │   Mock LLM  │              │  OpenAI API │          │ │ │
│  │  │  │ (Fallback)  │              │ (Primary)   │          │ │ │
│  │  │  └─────────────┘              └─────────────┘          │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  ADMIN API                                 │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │ File Upload │ │ File List   │ │ Reindex     │          │ │
│  │  │             │ │             │ │ Documents   │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                ANALYTICS API                               │ │
│  │  ┌─────────────┐              ┌─────────────┐              │ │
│  │  │Rate Limits  │              │   Safety    │              │ │
│  │  │Analytics    │              │  Analytics  │              │ │
│  │  └─────────────┘              └─────────────┘              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                EVALUATION API                              │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │            Comprehensive Testing Suite                  │ │ │
│  │  │  • 6 Test Categories (pricing, getting-started, etc.)  │ │ │
│  │  │  • Performance Metrics (response time, confidence)     │ │ │
│  │  │  • Automated Testing with Predefined Questions         │ │ │
│  │  │  • Detailed Reporting and Analytics                    │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Evaluation System Architecture

### Enhanced Evaluation Results Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                EVALUATION DASHBOARD                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              EVALUATION CONTROLS                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │Run Evaluation│  │📊 Export    │  │Show Details │        │ │
│  │  │   Button     │  │   Report    │  │   Toggle    │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              SUMMARY METRICS CARDS                         │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────┐ │ │
│  │  │Tests Passed │ │Success Rate │ │Avg Response │ │Conf.  │ │ │
│  │  │   5/6       │ │   83.33%    │ │   42ms      │ │ 85%   │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └───────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              PERFORMANCE BREAKDOWNS                        │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │            Performance by Category                     │ │ │
│  │  │  • pricing: 1/1 tests (100%) - 43ms avg               │ │ │
│  │  │  • onboarding: 1/1 tests (100%) - 43ms avg            │ │ │
│  │  │  • support: 1/1 tests (100%) - 53ms avg               │ │ │
│  │  │  • general: 1/1 tests (100%) - 47ms avg               │ │ │
│  │  │  • complex: 1/1 tests (100%) - 39ms avg               │ │ │
│  │  │  • guardrails: 0/1 tests (0%) - 29ms avg              │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │            Performance by Difficulty                   │ │ │
│  │  │  • easy: 3/4 tests (75%) - 41ms avg                   │ │ │
│  │  │  • medium: 1/1 tests (100%) - 53ms avg                │ │ │
│  │  │  • hard: 1/1 tests (100%) - 39ms avg                  │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              BEST/WORST TEST ANALYSIS                      │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  ✅ Best Performing Test                               │ │ │
│  │  │  "What are the pricing tiers and what's included?"     │ │ │
│  │  │  Overall Score: 129%                                  │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  ⚠️ Needs Improvement                                  │ │ │
│  │  │  "What services do you offer?"                         │ │ │
│  │  │  Overall Score: 106%                                  │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Evaluation System Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                EVALUATION SYSTEM FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Admin Panel → Run Evaluation → Test Suite Execution           │
│       │              │                    │                    │
│       │              │                    ▼                    │
│       │              │         ┌─────────────────────┐         │
│       │              │         │   Test Categories   │         │
│       │              │         │  • pricing          │         │
│       │              │         │  • getting-started  │         │
│       │              │         │  • refunds          │         │
│       │              │         │  • general          │         │
│       │              │         │  • complex          │         │
│       │              │         │  • guardrails       │         │
│       │              │         └─────────────────────┘         │
│       │              │                    │                    │
│       │              │                    ▼                    │
│       │              │         ┌─────────────────────┐         │
│       │              │         │  Performance        │         │
│       │              │         │  Metrics Collection │         │
│       │              │         │  • Response Time    │         │
│       │              │         │  • Confidence Score │         │
│       │              │         │  • Source Relevance │         │
│       │              │         │  • Success Rate     │         │
│       │              │         └─────────────────────┘         │
│       │              │                    │                    │
│       │              │                    ▼                    │
│       │              │         ┌─────────────────────┐         │
│       │              │         │  Analytics Engine   │         │
│       │              │         │  • Category Stats   │         │
│       │              │         │  • Difficulty Stats │         │
│       │              │         │  • Best/Worst Tests │         │
│       │              │         │  • Overall Summary  │         │
│       │              │         └─────────────────────┘         │
│       │              │                    │                    │
│       │              │                    ▼                    │
│       │              │         ┌─────────────────────┐         │
│       │              │         │  Results Display    │         │
│       │              │         │  • Visual Dashboard │         │
│       │              │         │  • Export Options   │         │
│       │              │         │  • Detailed View    │         │
│       │              │         └─────────────────────┘         │
│       │              │                    │                    │
│       │              └────────────────────┘                    │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              REAL-TIME UPDATES                             │ │
│  │  • Live progress indication                                │ │
│  │  • Immediate results display                               │ │
│  │  • Interactive dashboard updates                           │ │
│  │  • Export functionality activation                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Evaluation Metrics Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                EVALUATION METRICS SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              CORE METRICS                                  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │Tests Passed │  │Success Rate │  │Avg Response │        │ │
│  │  │   (5/6)     │  │  (83.33%)   │  │   (42ms)    │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │Confidence   │  │Retrieval    │  │Source       │        │ │
│  │  │  (85%)      │  │  Time       │  │Relevance    │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              CATEGORY BREAKDOWN                            │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  pricing: 1/1 tests (100%) - 43ms avg                 │ │ │
│  │  │  onboarding: 1/1 tests (100%) - 43ms avg              │ │ │
│  │  │  support: 1/1 tests (100%) - 53ms avg                 │ │ │
│  │  │  general: 1/1 tests (100%) - 47ms avg                 │ │ │
│  │  │  complex: 1/1 tests (100%) - 39ms avg                 │ │ │
│  │  │  guardrails: 0/1 tests (0%) - 29ms avg                │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              DIFFICULTY BREAKDOWN                          │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  easy: 3/4 tests (75%) - 41ms avg                     │ │ │
│  │  │  medium: 1/1 tests (100%) - 53ms avg                  │ │ │
│  │  │  hard: 1/1 tests (100%) - 39ms avg                    │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              TEST ANALYSIS                                 │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  ✅ Best: "What are the pricing tiers..." (129%)       │ │ │
│  │  │  ⚠️ Worst: "What services do you offer?" (106%)        │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### 1. Chat Request Flow

```
User Input → ChatInput → ChatInterface → API Gateway → Rate Limiter
     ↓
Safety Guard → Document Retriever → LLM Provider → Streaming Response
     ↓
ChatMessage → UI Update → Citation Display → Safety Info
```

### 2. Document Processing Flow

```
Markdown Files → File System → Document Retriever → BM25 Indexing
     ↓
Paragraph Splitting → Tokenization → Scoring Algorithm → Search Results
     ↓
Citation Generation → Response Context → LLM Processing → Final Answer
```

### 3. Evaluation System Flow

```
Admin Panel → Run Evaluation → Test Suite → Document Retriever
     ↓
LLM Provider → Performance Metrics → Analytics Engine → Results Display
     ↓
Export Function → JSON Report → Download → Analysis
```

## 🗄️ Data Architecture

### Knowledge Base Structure

```
data/
├── getting-started.md    # User onboarding content
├── pricing.md           # Pricing plans and tiers
├── refunds.md           # Refund policy information
├── Munichen.md          # Additional content
└── Teddy.md             # Additional content
```

### Document Processing Pipeline

```
Raw Markdown → Paragraph Splitting → Tokenization → BM25 Indexing
     ↓
In-Memory Storage → Search Index → Retrieval Engine → Context Building
     ↓
Citation Mapping → Response Generation → Source Attribution
```

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    CACHING LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Document     │  │Rate Limit   │  │Safety       │        │
│  │Cache        │  │Cache        │  │Metrics      │        │
│  │(In-Memory)  │  │(Per IP)     │  │Cache        │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Security Architecture

### Multi-Layer Security

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                RATE LIMITING                           │ │
│  │  • 10 requests per minute per IP                       │ │
│  │  • IP-based tracking and monitoring                    │ │
│  │  • Graceful degradation on limits                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                CONTENT FILTERING                       │ │
│  │  • AI-powered safety scanning                          │ │
│  │  • Pattern-based threat detection                      │ │
│  │  • Context-aware validation                            │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                INPUT VALIDATION                        │ │
│  │  • Request format validation                           │ │
│  │  • File type and size restrictions                     │ │
│  │  │  • Error handling and sanitization                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Monitoring & Analytics Architecture

### Real-Time Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│                MONITORING SYSTEM                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Rate Limit   │  │Safety       │  │Performance  │        │
│  │Analytics    │  │Analytics    │  │Metrics      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│           │               │               │                │
│           └───────────────┼───────────────┘                │
│                           │                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              DASHBOARD LAYER                           │ │
│  │  • Real-time metrics display                           │ │
│  │  • Visual charts and graphs                            │ │
│  │  • Export functionality                                │ │
│  │  • Historical data tracking                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Performance Architecture

### Optimization Strategies

```
┌─────────────────────────────────────────────────────────────┐
│                PERFORMANCE LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                STREAMING RESPONSES                     │ │
│  │  • Server-Sent Events (SSE)                            │ │
│  │  • Real-time content delivery                          │ │
│  │  • Progressive loading                                 │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                RAG OPTIMIZATION                        │ │
│  │  • BM25 scoring algorithm                              │ │
│  │  • Paragraph-level retrieval                           │ │
│  │  • Fallback mechanisms                                 │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                CACHING STRATEGY                        │ │
│  │  • In-memory document cache                            │ │
│  │  • Rate limit state caching                            │ │
│  │  • Analytics data persistence                          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack Architecture

### Frontend Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND STACK                          │
├─────────────────────────────────────────────────────────────┤
│  • Next.js 14 (App Router)                                 │
│  • React 18 (Components & Hooks)                           │
│  • TypeScript (Type Safety)                                │
│  • Tailwind CSS (Styling)                                  │
│  • Context API (State Management)                          │
└─────────────────────────────────────────────────────────────┘
```

### Backend Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND STACK                           │
├─────────────────────────────────────────────────────────────┤
│  • Next.js API Routes (Serverless Functions)               │
│  • Node.js Runtime                                         │
│  • Custom RAG System (BM25)                                │
│  • OpenAI API Integration (Optional)                       │
│  • File System (Document Storage)                          │
└─────────────────────────────────────────────────────────────┘
```

### Development & Testing Stack

```
┌─────────────────────────────────────────────────────────────┐
│                DEVELOPMENT STACK                           │
├─────────────────────────────────────────────────────────────┤
│  • Jest (Testing Framework)                                │
│  • TypeScript (Development Language)                       │
│  • ESLint (Code Linting)                                   │
│  • PostCSS (CSS Processing)                                │
│  • Custom Test Scripts (API & Retriever Testing)           │
└─────────────────────────────────────────────────────────────┘
```

## 🌐 Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                PRODUCTION DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                CDN/EDGE LAYER                          │ │
│  │  • Static asset delivery                               │ │
│  │  • Global content distribution                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                APPLICATION LAYER                       │ │
│  │  • Next.js production build                            │ │
│  │  • Serverless function deployment                      │ │
│  │  • Auto-scaling capabilities                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                DATA LAYER                              │ │
│  │  • File system storage                                 │ │
│  │  • In-memory caching                                   │ │
│  │  • Environment variable configuration                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📈 Scalability Architecture

### Horizontal Scaling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                SCALABILITY DESIGN                          │
├─────────────────────────────────────────────────────────────┤
│  • Stateless API design                                    │
│  • Serverless function architecture                        │
│  • In-memory caching for performance                       │
│  • Rate limiting for resource protection                   │
│  • Modular component design                                │
│  • Independent service scaling                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 System Integration Points

### External Integrations

```
┌─────────────────────────────────────────────────────────────┐
│                INTEGRATION POINTS                          │
├─────────────────────────────────────────────────────────────┤
│  • OpenAI API (Optional LLM provider)                      │
│  • File System (Document storage and retrieval)            │
│  • Browser APIs (Local storage, theme management)          │
│  • HTTP APIs (RESTful communication)                       │
└─────────────────────────────────────────────────────────────┘
```

This architecture documentation provides a comprehensive view of the HelpDesk AI system, showing how all components work together to create a robust, scalable, and maintainable AI-powered helpdesk application.
