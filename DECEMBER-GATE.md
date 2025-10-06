# December Excellence Gate 🚀

This repository now has **enterprise-grade quality gates** that run on every PR and push to main.

## What's Enforced

✅ **Node Version Pinning** – Exact Node.js version from `.nvmrc`  
✅ **Secret Scanning** – Gitleaks checks for leaked credentials  
✅ **Dependency Audit** – Security vulnerabilities & unused deps  
✅ **Code Quality** – Linting with zero warnings  
✅ **Type Safety** – TypeScript type-checking  
✅ **Docker Build** – Image builds successfully with size budget (<500 MiB)

## Quick Start

### Local Pre-Flight Check

Before pushing, run the fix script to catch issues early:

```bash
./scripts/fix-december.sh
```

This runs all the same checks that CI will run, so you can fix issues before pushing.

### Manual Checks

If you prefer to run checks individually:

```bash
# Check Node version
node -v  # Should match .nvmrc (v20.11.1)

# Frontend checks
cd frontend
npm ci
npm run lint
npm run type-check
npx depcheck
cd ..

# Backend checks
cd backend
bun install
cd ..

# Docker build
docker build -t december:ci .

# Secret scan
./scripts/gitleaks detect --source . --verbose --no-git
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/december-gate.yml`) automatically runs on:
- All pull requests
- Pushes to `main` branch

### Enable Branch Protection

To require the gate before merging:

1. Go to **GitHub Settings** → **Branches**
2. Add rule for `main` branch
3. Enable **Require status checks to pass before merging**
4. Search for and select **december-gate**
5. Save changes

## Files Created

```
.
├── .nvmrc                              # Node version lock
├── .dockerignore                       # Docker build exclusions
├── Dockerfile                          # Multi-stage production build
├── DECEMBER-GATE.md                    # This file
├── .github/
│   └── workflows/
│       └── december-gate.yml           # CI workflow
├── scripts/
│   └── fix-december.sh                 # Local check script
└── frontend/
    └── package.json                    # Updated with type-check & depcheck scripts
```

## Troubleshooting

### "Node version mismatch"
```bash
nvm use  # or install the version from .nvmrc
```

### "Gitleaks found secrets"
Review the flagged files and remove sensitive data. Use environment variables or `.env` files (which are gitignored).

### "Unused dependencies detected"
```bash
cd frontend
npx depcheck
# Remove unused packages from package.json
```

### "Lint errors"
```bash
cd frontend
npm run lint -- --fix  # Auto-fix what's possible
```

### "Type errors"
```bash
cd frontend
npm run type-check
# Fix TypeScript errors in flagged files
```

### "Docker image too large"
Optimize your Dockerfile:
- Use multi-stage builds (already implemented)
- Remove unnecessary dependencies
- Use `.dockerignore` to exclude files

## Customization

### Adjust Docker Size Limit

Edit `.github/workflows/december-gate.yml` line with `max_size=524288000` (currently 500 MiB).

### Skip Specific Checks

Comment out steps in the workflow you don't need, but **we recommend keeping all checks** for production quality.

### Add More Checks

Add additional steps to the workflow, such as:
- Unit tests
- Integration tests
- Security scanning (Snyk, etc.)
- Performance benchmarks

## Cost

**$0/month** – Runs on GitHub Actions free tier (2,000 minutes/month for private repos, unlimited for public repos).

---

**Ship with confidence** – Every commit is now validated before it reaches production! 🎉
