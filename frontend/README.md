# December AI IDE - Browser-Based Frontend

An AI-assisted integrated development environment that runs entirely in your browser with no backend dependencies.

## Features

- ✨ **AI-Powered Coding**: Direct integration with OpenAI/Claude for code generation
- 💾 **Local Storage**: All files stored securely in your browser using IndexedDB
- 📦 **Project Management**: Create and manage multiple projects
- 💬 **Real-time Chat**: Interactive AI assistant for coding help
- 📤 **Export Projects**: Download your projects as ZIP files
- 🎨 **Modern UI**: Beautiful, responsive interface with live preview
- 🔒 **Privacy First**: All data stays in your browser

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- An API key from [OpenRouter](https://openrouter.ai/) or OpenAI

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure your AI API key:

Create a `.env.local` file:
```env
NEXT_PUBLIC_AI_API_KEY=your_api_key_here
NEXT_PUBLIC_AI_BASE_URL=https://openrouter.ai/api/v1
NEXT_PUBLIC_AI_MODEL=anthropic/claude-sonnet-4
```

Or set it at runtime via localStorage:
```javascript
localStorage.setItem('ai_api_key', 'your_key_here');
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:5000](http://localhost:5000) in your browser

## Architecture

### Browser-Based Services

- **AI Service** (`lib/services/ai.ts`): Direct OpenAI/Claude API integration
- **File System** (`lib/services/fileSystem.ts`): IndexedDB-based virtual file system
- **Container Service** (`lib/services/container.ts`): Project management
- **Export Service** (`lib/services/export.ts`): Browser-based ZIP generation

### Data Storage

- **Projects**: Stored in localStorage
- **Files**: Stored in IndexedDB
- **Chat History**: Stored in memory (session-based)

## Usage

### Creating a Project

1. Click "Create New Project" or use the prompt interface
2. Type what you want to build
3. The AI will generate the initial code

### Working with Files

- View files in the file tree
- Edit code with syntax highlighting
- AI can modify files based on your instructions

### Exporting Projects

Click the "Export" button to download your project as a ZIP file containing all source files.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_AI_API_KEY` | Your AI API key | - |
| `NEXT_PUBLIC_AI_BASE_URL` | AI API endpoint | `https://openrouter.ai/api/v1` |
| `NEXT_PUBLIC_AI_MODEL` | AI model to use | `anthropic/claude-sonnet-4` |

### Supported AI Models

- Anthropic Claude (via OpenRouter)
- OpenAI GPT models
- Any OpenAI-compatible API

## Development

### Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── projects/           # Project pages & components
│   │   ├── editor/             # Code editor components
│   │   └── create/             # Project creation
│   ├── lib/
│   │   ├── services/           # Browser-based services
│   │   │   ├── ai.ts          # AI integration
│   │   │   ├── fileSystem.ts  # IndexedDB file management
│   │   │   ├── container.ts   # Project management
│   │   │   ├── export.ts      # ZIP export
│   │   │   └── api.ts         # Unified API interface
│   │   └── backend/           # (Legacy - to be removed)
│   └── ...
├── public/                     # Static assets
├── package.json
└── README.md
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires IndexedDB and modern JavaScript support.

## Storage Limits

- IndexedDB: ~50-100MB per origin (varies by browser)
- LocalStorage: ~5-10MB
- Monitor usage to avoid exceeding limits

## Troubleshooting

### "API key not configured" error

Make sure you've set the `NEXT_PUBLIC_AI_API_KEY` in your `.env.local` file or via localStorage.

### Files not persisting

Check if your browser allows IndexedDB. Some privacy modes block it.

### CORS errors

Ensure your AI provider supports browser requests. OpenRouter does by default.

## Security

- API keys are stored in environment variables or browser localStorage
- All data processing happens client-side
- No server-side data collection
- Users have full control over their data

## Future Enhancements

- [ ] WebContainer integration for in-browser code execution
- [ ] Cloud sync (GitHub, Dropbox)
- [ ] Collaborative editing
- [ ] More AI models support
- [ ] Storage quota monitoring UI
- [ ] Offline mode

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, React, and AI
