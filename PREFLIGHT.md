# 🚀 Pre-Flight Checklist for New Repos
*Run these checks before your first commit. All boxes green? You're cleared for takeoff.*

---

## **1️⃣ Language Runtime**
**Goal:** Ensure the correct language runtime is installed and accessible.

- [ ] **Node.js Version Check:** Run `node -v` and verify you have Node.js ≥18.x (required for Next.js 15)
- [ ] **Bun Version Check:** Run `bun -v` and verify you have Bun ≥1.0 (optional but recommended for backend)
- [ ] **TypeScript Version:** Run `npx tsc --version` and verify TypeScript 5.x is available
- [ ] **IDE Integration:** Confirm the IDE is using the correct Node.js version (check the status bar or run `which node`)

---

## **2️⃣ Dependency Manager**
**Goal:** Verify the dependency manager is functional and dependencies are locked.

### Frontend
- [ ] **Tool Health:** Run `cd frontend && npm -v`—no warnings or errors should appear
- [ ] **Lockfile Integrity:** Verify `package-lock.json` exists and is committed
- [ ] **Install Dependencies:** Run `npm install` and confirm it completes with **0 errors**
- [ ] **Audit Check:** Run `npm audit --production` and address any critical vulnerabilities

### Backend
- [ ] **Tool Health:** Run `cd backend && bun -v` or `npm -v`
- [ ] **Lockfile Integrity:** Verify `bun.lock` or `package-lock.json` exists
- [ ] **Install Dependencies:** Run `bun install` or `npm install` and confirm **0 errors**

---

## **3️⃣ Virtual Environment**
**Goal:** Ensure the project environment is isolated and properly configured.

- [ ] **Node Modules Exist:** Verify `frontend/node_modules` and `backend/node_modules` exist
- [ ] **Gitignore Check:** Confirm `node_modules` is listed in `.gitignore`
- [ ] **IDE Configuration:** Check that the IDE is using the project's Node.js and TypeScript versions

---

## **4️⃣ Linting & Formatting**
**Goal:** Confirm linting and formatting tools are installed and functional.

### Frontend
- [ ] **ESLint Check:** Run `cd frontend && npm run lint`—must exit with **0 errors**
- [ ] **Prettier Format:** If Prettier is configured, run `npx prettier --check .`
- [ ] **IDE Automation:** Enable "on-save" linting/formatting in IDE settings

### Backend
- [ ] **ESLint Check:** Run `cd backend && npx eslint src/`—must exit with **0 errors**
- [ ] **Prettier Format:** If Prettier is configured, run `npx prettier --check src/`

---

## **5️⃣ Type Checking**
**Goal:** Ensure type checking is strict and passes.

### Frontend
- [ ] **Type Check:** Run `cd frontend && npx tsc --noEmit`—must return **0 errors**
- [ ] **Strict Mode:** Verify `strict: true` is enabled in `tsconfig.json`

### Backend
- [ ] **Type Check:** Run `cd backend && npx tsc --noEmit`—must return **0 errors**
- [ ] **Strict Mode:** Verify `strict: true` is enabled in `tsconfig.json`

---

## **6️⃣ Unit Tests**
**Goal:** All tests pass with sufficient coverage.

- [ ] **Frontend Tests:** Run `cd frontend && npm test` (if configured)—must show **100% passed**
- [ ] **Backend Tests:** Run `cd backend && bun test` or `npm test` (if configured)
- [ ] **Coverage Baseline:** Enforce ≥80% coverage in CI configuration

---

## **7️⃣ Pre-Commit Hooks**
**Goal:** Ensure hooks are installed and functional.

- [ ] **Install Hooks:** Run `pre-commit install` (requires pre-commit to be installed)
- [ ] **Test Hooks:** Execute `pre-commit run --all-files`—must exit with **0 errors**
- [ ] **Verify Config:** Check that `.pre-commit-config.yaml` exists and is properly configured

---

## **8️⃣ Build Artifact**
**Goal:** Verify the project can be built successfully.

### Frontend
- [ ] **Build Command:** Run `cd frontend && npm run build`—must finish with **0 errors**
- [ ] **Output Location:** Confirm the build artifact is in `frontend/.next/` and is `.gitignore`d

### Backend
- [ ] **TypeScript Build:** Run `cd backend && npx tsc`—must compile with **0 errors**
- [ ] **Build Output:** Verify compiled files are generated (if applicable) and are `.gitignore`d

---

## **9️⃣ Runtime Smoke Test**
**Goal:** Validate the application starts without errors.

### Backend
- [ ] **Start Application:** Run `cd backend && bun run src/index.ts` or `npm start`—no stack traces
- [ ] **Health Check:** If applicable, run `curl localhost:3001/health`—must return **HTTP 200**

### Frontend
- [ ] **Start Dev Server:** Run `cd frontend && npm run dev`—server starts on port 3000
- [ ] **Page Load:** Visit `http://localhost:3000` and verify the page loads without console errors

---

## **🔐 Secrets & Credentials**
**Goal:** Ensure no secrets are committed.

- [ ] **Git History Scan:** Run `git log --all -p -S 'password|secret|key|token' -- .`—must return **no sensitive results**
- [ ] **Environment Files:** Verify `.env.example` exists and `.env` is in `.gitignore`
- [ ] **Secrets Scanner:** Run `git secrets --scan` or `trufflehog` (if installed) to detect leaked credentials

---

## **⚙️ Editor Settings**
**Goal:** Standardize editor settings across contributors.

- [ ] **VSCode Config:** Check `.vscode/settings.json` exists with project-relative paths only
- [ ] **EditorConfig:** Ensure an `.editorconfig` file exists for consistent indentation/charset
- [ ] **Gitignore IDE Files:** Verify `.idea/`, `.vscode/`, and other IDE-specific files are `.gitignore`d

---

## **🤖 CI Gatekeeper**
**Goal:** Confirm CI is configured and enforced.

- [ ] **CI File:** Verify `.github/workflows/ci.yml` exists and is properly configured
- [ ] **CI Passes Locally:** Simulate CI checks locally (lint, typecheck, test, build)
- [ ] **Branch Protection:** Ensure the CI status check is marked as **"Required"** in GitHub repo settings

---

## **🎯 One-Command Sanity Check**

Run this script to automate the checklist:

```bash
#!/bin/bash
set -e

echo "🚀 Running Pre-Flight Checks..."

# Check Node.js version
echo "✓ Checking Node.js version..."
node -v | grep -E "v(18|20|21|22)" || (echo "❌ Node.js ≥18 required" && exit 1)

# Frontend checks
echo "✓ Installing frontend dependencies..."
cd frontend
npm install

echo "✓ Running frontend linter..."
npm run lint

echo "✓ Type checking frontend..."
npx tsc --noEmit

echo "✓ Building frontend..."
npm run build

cd ..

# Backend checks
echo "✓ Installing backend dependencies..."
cd backend
bun install || npm install

echo "✓ Type checking backend..."
npx tsc --noEmit

cd ..

# Pre-commit hooks (if configured)
if command -v pre-commit &> /dev/null; then
    echo "✓ Running pre-commit hooks..."
    pre-commit run --all-files
fi

# Git secrets check
echo "✓ Scanning for secrets..."
if git log --all -p -S 'password|secret|key' -- . | grep -i "password\|secret\|api.key" > /dev/null; then
    echo "⚠️  Warning: Potential secrets found in git history"
fi

echo ""
echo "🚀 ALL SYSTEMS GO! Ready to push your first commit."
```

Save this as `preflight.sh`, make it executable with `chmod +x preflight.sh`, and run it:

```bash
./preflight.sh
```

**If the script exits 0, you're ready to push your first commit!**

---

## **📋 Why This Works**

- **Clear Ownership:** Each section has a specific goal
- **Actionable:** Every item is a command or a verifiable check
- **Automatable:** The one-command script ties everything together
- **Scalable:** Adapt the commands for any language/ecosystem
- **Monorepo-Aware:** Handles both frontend and backend checks independently

---

## **🔧 Quick Setup for Missing Tools**

### Install Pre-Commit
```bash
pip install pre-commit
# or
brew install pre-commit
```

### Install ESLint & Prettier (if missing)
```bash
# Frontend
cd frontend
npm install -D eslint prettier eslint-config-prettier

# Backend
cd backend
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Setup Git Secrets Scanner
```bash
# Using trufflehog
brew install trufflesecurity/trufflehog/trufflehog
# or
pip install truffleHog
```

---

**Happy Coding! 🎉**
