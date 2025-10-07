# December - AI-Powered Full-Stack Development Platform

## Overview

December is an open-source alternative to AI-powered development platforms like Loveable, Replit, and Bolt. It enables users to build full-stack applications from natural language prompts using AI, with complete privacy through local execution and personal API keys.

The platform creates containerized Next.js applications with Docker, providing a live preview environment, Monaco code editor, and real-time AI chat assistance for iterative development.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- Next.js 15.3.2 with App Router and React 19
- TypeScript for type safety
- Tailwind CSS 4 for styling
- Monaco Editor for code editing
- React Hot Toast for notifications

**Design Patterns:**
- Server components by default with selective client components ("use client" directive)
- File-based routing in `src/app` directory
- Component composition following atomic design principles
- Path aliasing using `@/*` for cleaner imports

**Key Features:**
1. **Project Management Dashboard** - View, create, and manage containerized applications
2. **Live Preview System** - Real-time preview with mobile/desktop viewport switching
3. **Code Editor** - Full-featured Monaco editor with file tree navigation, syntax highlighting, and multi-tab support
4. **AI Chat Interface** - Conversational AI assistant for development help with attachment support (images/documents)
5. **Workspace View** - Split-screen interface combining preview, editor, and chat

**Rationale:** Next.js App Router chosen for modern React patterns, improved performance, and built-in optimizations. Monaco Editor provides VS Code-like experience familiar to developers.

### Backend Architecture

**Technology Stack:**
- Bun runtime for performance
- Express 5.1.0 for API routing
- Docker/Dockerode for container orchestration
- OpenAI SDK for LLM integration

**API Structure:**
1. **Container Routes** (`/containers`)
   - Create, list, start, stop, delete containers
   - File management (read, write, tree traversal)
   - Package management (dependency installation)
   - Export functionality (download as zip)

2. **Chat Routes** (`/chat/:containerId/messages`)
   - Message sending with streaming support
   - Attachment handling (images, documents)
   - Context-aware conversations per container

**Container Management:**
- Dynamic port allocation (BASE_PORT: 8000)
- Automatic cleanup of unused resources
- Label-based container identification
- Health monitoring and status tracking

**Rationale:** Express chosen for maturity and middleware ecosystem. Bun runtime provides faster execution. Docker containers ensure isolated, reproducible development environments. Streaming support enables real-time AI responses.

### LLM Integration

**Configuration:**
- Configurable AI provider (default: OpenRouter with Claude Sonnet 4)
- Custom base URL and API key support via environment variables
- Streaming and non-streaming response modes

**Prompt Engineering:**
- System prompt defines December's identity as AI code editor
- Context includes file tree, conversation history, and attachments
- Special XML-like tags for structured operations:
  - `<create_file>` - File creation
  - `<update_file>` - File modifications
  - `<delete_file>` - File deletion
  - `<install_package>` - Dependency management
  - `<thinking>` - Reasoning display

**Rationale:** OpenRouter provides access to multiple LLM providers through single API. Claude Sonnet 4 chosen for strong coding capabilities and instruction following. Structured tags enable reliable code manipulation parsing.

### File System Operations

**Implementation:**
- Docker exec commands for file operations inside containers
- Tree traversal with exclusion of `node_modules` and `.next`
- In-memory file tree caching on frontend
- Dirty state tracking for unsaved changes

**Security Considerations:**
- Path validation to prevent directory traversal
- Container isolation for multi-tenant safety
- Read-only operations where appropriate

### State Management

**Approach:**
- React hooks (useState, useEffect, useRef) for local state
- Server state fetched via REST API calls
- Real-time updates through polling intervals
- Toast notifications for user feedback

**Chat Session Management:**
- In-memory Map storage (could be extended to persistent DB)
- Session per container with message history
- Attachment metadata stored with messages

**Rationale:** Simple state management sufficient for current scope. Polling used instead of WebSockets for simplicity. Future enhancement could add React Query for better server state caching.

### Development Workflow

**Container Lifecycle:**
1. User creates project from prompt or template
2. Backend builds Docker image with Next.js base
3. Container starts with assigned port
4. User interacts via chat to modify code
5. AI executes file operations via special tags
6. Live preview updates automatically
7. User can export final code as zip

**Code Editing:**
- Direct file editing via Monaco editor
- AI-assisted editing via chat commands
- Auto-save with dirty state indicators
- Multi-tab editing support

## External Dependencies

### Core Services
- **Docker** - Container runtime for isolated app environments (required, must be installed locally)
- **OpenRouter/OpenAI API** - LLM provider for AI code generation (requires API key)

### Third-Party Libraries

**Frontend:**
- `@monaco-editor/react` (4.7.0) - Code editor component
- `lucide-react` (0.511.0) - Icon library
- `react-hot-toast` (2.5.2) - Toast notifications
- `react-icons` (5.5.0) - Additional icons

**Backend:**
- `dockerode` (4.0.6) - Docker API client for Node.js
- `openai` (5.0.1) - OpenAI SDK (used with custom base URLs)
- `express` (5.1.0) - Web framework
- `uuid` (11.1.0) - Unique ID generation

### Infrastructure Requirements
- **Node.js/Bun** - Runtime environment
- **Docker Engine** - Container orchestration
- **Port availability** - Dynamic allocation from 8000+

### Optional Integrations
- **Vercel** - Deployment platform (configured via vercel.json)
- **Custom AI providers** - Via AI_BASE_URL environment variable

### Environment Variables
```
AI_BASE_URL - AI provider endpoint (default: OpenRouter)
AI_API_KEY - API key for AI service
AI_MODEL - Model identifier (default: anthropic/claude-sonnet-4)
PORT - Backend port (default: 4000)
```

### Database
- Currently uses in-memory storage for chat sessions
- File system operations via Docker volumes
- No persistent database required (stateless design)

**Note:** Future enhancements may add Postgres with Drizzle ORM for persistent storage of projects, chat history, and user data.