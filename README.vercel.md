# Deploying December to Vercel

December is a monorepo with separate `frontend/` and `backend/` directories. The frontend is a Next.js application that can be deployed to Vercel.

## Deployment Steps

### Option 1: Using Vercel Dashboard (Recommended)

1. **Import your repository** to Vercel
2. **Configure the Root Directory:**
   - Go to Project Settings → General
   - Set **Root Directory** to: `frontend`
   - Framework Preset should auto-detect as **Next.js**
3. **Configure Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. **Environment Variables** (if needed):
   - Add `NEXT_PUBLIC_API_URL` pointing to your backend (if deploying backend separately)
5. **Deploy!**

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from the root directory
vercel --cwd frontend

# Or deploy with production flag
vercel --prod --cwd frontend
```

### Option 3: Using vercel.json (Automated)

A `vercel.json` file is included in the root, but you still need to set the **Root Directory** to `frontend` in your Vercel project settings.

## Important Notes

### Backend Deployment

The backend is **not deployed to Vercel** by default. The backend requires:
- Docker support
- Long-running processes
- File system access

For the backend, consider deploying to:
- **Railway** - Great for Docker containers
- **Render** - Supports Docker and long-running services
- **Fly.io** - Excellent for containerized apps
- **Your own server** - Full control

### Environment Variables

Make sure to set these in Vercel:

```bash
# Backend API URL (if backend is deployed separately)
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Or for local development backend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Monorepo Configuration

If Vercel doesn't automatically detect the Next.js app:

1. Go to **Project Settings** → **General**
2. Set **Root Directory** to `frontend`
3. Framework Preset: `Next.js`
4. Node.js Version: `20.x` (recommended)

## Troubleshooting

### 404 Error After Deployment

**Cause:** Vercel is building from the wrong directory (root instead of `frontend/`)

**Solution:**
1. Go to Project Settings → General
2. Set Root Directory to `frontend`
3. Redeploy

### Build Fails

**Check:**
1. All dependencies are in `frontend/package.json`
2. Build succeeds locally: `cd frontend && npm run build`
3. Node.js version matches (use `.nvmrc` or specify in settings)

### API Calls Failing

**Cause:** Backend URL not configured

**Solution:**
Set `NEXT_PUBLIC_API_URL` environment variable in Vercel settings

## Quick Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/december&project-name=december&root-directory=frontend)

*Note: Replace YOUR_USERNAME with your GitHub username*

## Local Development

```bash
# Install dependencies
cd frontend && npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Additional Resources

- [Vercel Monorepo Documentation](https://vercel.com/docs/monorepos)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
