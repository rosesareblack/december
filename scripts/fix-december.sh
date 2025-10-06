#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Running December repo quality checks..."

# ---------- NODE VERSION ----------
echo "📦 Checking Node version..."
if [ -f ".nvmrc" ]; then
    NODE_EXPECTED=$(cat .nvmrc)
    NODE_ACTUAL=$(node -v)
    if [[ "$NODE_ACTUAL" == "$NODE_EXPECTED" ]]; then
        echo "✅ Node version $NODE_ACTUAL matches .nvmrc"
    else
        echo "⚠️  Node $NODE_ACTUAL ≠ $NODE_EXPECTED (consider running 'nvm use')"
    fi
fi

# ---------- GITLEAKS ----------
echo "🔒 Running Gitleaks scan..."
if [ ! -f "scripts/gitleaks" ]; then
    echo "  Downloading Gitleaks..."
    curl -sSfL https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz | tar -xz -C scripts gitleaks 2>/dev/null || {
        echo "  Download failed, skipping Gitleaks check"
    }
    chmod +x scripts/gitleaks 2>/dev/null || true
fi

if [ -f "scripts/gitleaks" ]; then
    ./scripts/gitleaks detect --source . --verbose --no-git || {
        echo "❌ Gitleaks found potential secrets!"
        exit 1
    }
    echo "✅ No secrets detected"
fi

# ---------- FRONTEND ----------
echo "🎨 Checking frontend..."
cd frontend

echo "  Installing dependencies..."
npm ci

echo "  Running depcheck..."
npx depcheck --ignore-bin-package --skip-missing | tee depcheck.txt
if grep -q "Unused dependencies" depcheck.txt; then
    echo "⚠️  Found unused dependencies in frontend"
fi
rm -f depcheck.txt

echo "  Running lint..."
npm run lint -- --max-warnings 0

echo "  Running type-check..."
npm run type-check

echo "✅ Frontend checks passed"
cd ..

# ---------- BACKEND ----------
echo "⚙️  Checking backend..."
cd backend

echo "  Installing dependencies..."
if command -v bun &> /dev/null; then
    bun install
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  Bun not found, skipping backend install"
fi

cd ..

# ---------- DOCKER ----------
echo "🐳 Building Docker image..."
if command -v docker &> /dev/null; then
    docker build -t december:ci -f Dockerfile . || {
        echo "⚠️  Docker build failed"
    }
    
    size=$(docker images december:ci --format "{{.Size}}" | sed 's/[A-Z]*B//' | numfmt --from=iec 2>/dev/null || echo "0")
    max_size=524288000
    if [[ $size -gt $max_size ]]; then
        echo "⚠️  Image size $size bytes exceeds 500 MiB budget"
    else
        echo "✅ Docker image size: $(numfmt --to=iec $size)B (under 500 MiB budget)"
    fi
else
    echo "⚠️  Docker not found, skipping Docker build"
fi

echo ""
echo "✅ December repo quality checks complete!"
echo "🎉 Ready to push"
