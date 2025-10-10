# Backend to Frontend Migration Guide

This document outlines the migration of the December AI IDE from a backend-dependent architecture to a fully browser-based solution.

## Changes Overview

### 1. AI API Integration
- **Before**: AI API calls were made from the backend Express server
- **After**: AI API calls are made directly from the browser using the OpenAI SDK with `dangerouslyAllowBrowser: true`
- **Location**: `frontend/src/lib/services/ai.ts`

### 2. File System Management
- **Before**: Files were stored in Docker containers using Docker exec commands
- **After**: Files are stored in browser IndexedDB for persistent storage
- **Location**: `frontend/src/lib/services/fileSystem.ts`

### 3. Container/Project Management
- **Before**: Docker containers were created and managed via Dockerode
- **After**: Projects are managed in browser localStorage, with files in IndexedDB
- **Location**: `frontend/src/lib/services/container.ts`

### 4. Code Execution
- **Before**: Code ran in Docker containers with port mapping
- **After**: Projects are stored locally; execution would require WebContainer or similar (future implementation)
- **Note**: Full WebContainer integration pending

### 5. Project Export
- **Before**: Server-side ZIP generation from Docker container files
- **After**: Browser-based ZIP generation using JSZip
- **Location**: `frontend/src/lib/services/export.ts`

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_AI_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_AI_BASE_URL=https://openrouter.ai/api/v1
NEXT_PUBLIC_AI_MODEL=anthropic/claude-sonnet-4
```

You can get an API key from [OpenRouter](https://openrouter.ai/).

Alternatively, users can configure their API keys at runtime using localStorage:
```javascript
localStorage.setItem('ai_api_key', 'your_key');
localStorage.setItem('ai_base_url', 'https://openrouter.ai/api/v1');
localStorage.setItem('ai_model', 'anthropic/claude-sonnet-4');
```

### 3. Run the Application
```bash
npm run dev
```

The application will run on `http://localhost:5000`.

## Architecture Comparison

### Old Architecture (Backend-Dependent)
```
Frontend (Next.js) → Backend (Express) → Docker → OpenAI API
                                      ↓
                               Docker Container
                            (File System + Runtime)
```

### New Architecture (Browser-Based)
```
Frontend (Next.js) → OpenAI API (direct)
                  ↓
            IndexedDB (files)
                  ↓
          LocalStorage (projects)
```

## Key Benefits

1. **No Backend Required**: Entire application runs in the browser
2. **No Docker Dependency**: Removes need for Docker installation
3. **Simplified Deployment**: Can be deployed as static site
4. **Offline Capable**: Files stored locally in browser
5. **Lower Infrastructure Costs**: No server needed

## Limitations & Future Work

1. **Code Execution**: Currently, code is stored but not executed in-browser
   - **Solution**: Integrate StackBlitz WebContainers or similar
   - **Alternative**: Use iframe preview with live-reloading

2. **API Keys**: Users must provide their own AI API keys
   - **Solution**: Implement secure proxy or use environment variables for shared keys

3. **Storage Limits**: IndexedDB has browser storage limits
   - **Typical Limit**: 50MB - 100MB per origin
   - **Solution**: Implement storage quota monitoring and cleanup

4. **Cross-Device Sync**: Projects are local to browser
   - **Solution**: Add optional cloud sync (GitHub, Dropbox, etc.)

## Migration Checklist

- [x] Create browser-based AI service
- [x] Implement IndexedDB file system
- [x] Create project management service
- [x] Add ZIP export functionality
- [x] Update frontend components to use new services
- [x] Add environment variable support
- [x] Install required dependencies (openai, jszip)
- [ ] Integrate WebContainers for code execution (pending)
- [ ] Add storage quota monitoring
- [ ] Implement cloud sync (optional)
- [ ] Add API key management UI

## Testing

### Test File Operations
```javascript
import { writeFile, getFile, listFiles } from './services/fileSystem';

// Write a file
await writeFile('project-id', 'src/test.ts', 'console.log("Hello")');

// Read a file
const content = await getFile('project-id', 'src/test.ts');

// List all files
const files = await listFiles('project-id');
```

### Test AI Integration
```javascript
import { sendMessage } from './services/ai';

const result = await sendMessage(
  'project-id',
  'Create a new React component',
  '{}', // code context
  'System prompt'
);
```

### Test Project Management
```javascript
import { createProject, getProjects } from './services/container';

// Create project
const project = createProject('Next.js');

// List projects
const projects = getProjects();
```

## Security Considerations

1. **API Keys**: Stored in environment variables or localStorage
   - Consider implementing encryption for localStorage
   - Add key rotation support
   - Implement rate limiting on client

2. **CORS**: Direct API calls require proper CORS configuration
   - OpenRouter supports browser requests
   - May need proxy for other providers

3. **Data Privacy**: All data stored locally in browser
   - No server-side data collection
   - Users own their data
   - Implement data export/backup

## Performance Considerations

1. **IndexedDB**: Async operations may impact large files
   - Implement pagination for file lists
   - Add loading states
   - Consider WebWorkers for heavy operations

2. **AI Streaming**: Direct browser streaming supported
   - Implement proper error handling
   - Add request cancellation
   - Monitor network usage

## Support & Resources

- [OpenAI SDK Documentation](https://platform.openai.com/docs)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [JSZip Documentation](https://stuk.github.io/jszip/)
- [WebContainers](https://webcontainers.io/)
