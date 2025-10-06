# 🔧 Vercel 404 Fix - Quick Guide

## ❌ The Problem

You're getting a **404 error** because Vercel is trying to build from the **root directory** instead of the `frontend/` directory. December is a monorepo with this structure:

```
december/
├── frontend/     ← Next.js app (needs to deploy here)
├── backend/      ← Express/Bun server (can't deploy to Vercel)
└── ...
```

---

## ✅ The Solution (Choose One)

### Option A: Fix via Vercel Dashboard (RECOMMENDED - 2 minutes)

1. Go to your Vercel project → **Settings** → **General**
2. Find **Root Directory** setting
3. Change from: `./` 
   To: **`frontend`**
4. Click **Save**
5. Go to **Deployments** → Click **⋯** on latest deployment → **Redeploy**

**That's it!** Your site should now build successfully.

---

### Option B: Fix via Vercel CLI

```bash
# From your project root
vercel --cwd frontend --prod

# Or set it permanently
vercel link
# Then manually edit .vercel/project.json to set rootDirectory
```

---

## 📋 Verify It's Working

After redeploying, you should see:

✅ **Build Output:**
```
Route (app)                                 Size  First Load JS
┌ ○ /                                    6.51 kB         117 kB
├ ○ /_not-found                            977 B         102 kB
├ ○ /community                           1.89 kB         107 kB
└ ƒ /projects/[containerId]                25 kB         135 kB
```

✅ **Your site loads at:** `https://your-project.vercel.app`

---

## ⚠️ Important Notes

### Backend Won't Deploy to Vercel

The **backend** requires Docker and can't run on Vercel. Options:

1. **Deploy backend elsewhere:**
   - Railway.app (easiest for Docker)
   - Render.com
   - Fly.io
   - Your own VPS

2. **Set environment variable in Vercel:**
   - Go to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL=https://your-backend-url.com`

3. **For local testing:**
   - Set `NEXT_PUBLIC_API_URL=http://localhost:4000`

---

## 🎯 Checklist

- [ ] Set Root Directory to `frontend` in Vercel dashboard
- [ ] Commit and push the new `vercel.json` and `.vercelignore` files
- [ ] Redeploy from Vercel dashboard
- [ ] Verify site loads correctly
- [ ] (Optional) Deploy backend separately if needed
- [ ] (Optional) Set `NEXT_PUBLIC_API_URL` env var if backend is deployed

---

## 📚 Full Documentation

See `README.vercel.md` for complete deployment guide with all options.

---

## 🆘 Still Having Issues?

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Build fails | Run `cd frontend && npm run build` locally to debug |
| 404 after fixing | Clear Vercel cache and redeploy |
| API calls fail | Set `NEXT_PUBLIC_API_URL` environment variable |
| Slow build | Remove `backend/` from build (use `.vercelignore`) |

**Debug Build Locally:**
```bash
cd frontend
npm install
npm run build
npm start
```

If it works locally, it should work on Vercel with the correct Root Directory setting.
