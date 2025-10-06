#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNED=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_check() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
    ((CHECKS_WARNED++))
}

# Start pre-flight checks
echo -e "${GREEN}🚀 Pre-Flight Checklist Runner${NC}"
echo -e "${GREEN}═══════════════════════════════${NC}"

# 1. Language Runtime
print_header "1️⃣  Language Runtime"

print_check "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    if echo "$NODE_VERSION" | grep -qE "v(18|20|21|22|23)"; then
        print_success "Node.js $NODE_VERSION (≥18.x required)"
    else
        print_error "Node.js $NODE_VERSION is too old (≥18.x required)"
    fi
else
    print_error "Node.js not found"
fi

print_check "Checking Bun version (optional)..."
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun -v)
    print_success "Bun $BUN_VERSION installed"
else
    print_warning "Bun not installed (optional but recommended)"
fi

print_check "Checking TypeScript version..."
if npx tsc --version &> /dev/null; then
    TS_VERSION=$(npx tsc --version)
    print_success "$TS_VERSION available"
else
    print_error "TypeScript not found"
fi

# 2. Dependency Manager & Dependencies
print_header "2️⃣  Dependencies"

# Frontend dependencies
print_check "Installing frontend dependencies..."
cd frontend
if npm install --silent > /dev/null 2>&1; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
fi

print_check "Checking frontend lockfile..."
if [ -f "package-lock.json" ]; then
    print_success "Frontend package-lock.json exists"
else
    print_warning "Frontend package-lock.json not found"
fi

cd ..

# Backend dependencies
print_check "Installing backend dependencies..."
cd backend
if bun install --silent > /dev/null 2>&1 || npm install --silent > /dev/null 2>&1; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
fi

print_check "Checking backend lockfile..."
if [ -f "bun.lock" ] || [ -f "package-lock.json" ]; then
    print_success "Backend lockfile exists"
else
    print_warning "Backend lockfile not found"
fi

cd ..

# 3. Linting & Formatting
print_header "4️⃣  Linting & Formatting"

print_check "Running frontend ESLint..."
cd frontend
if npm run lint > /dev/null 2>&1; then
    print_success "Frontend linting passed"
else
    print_error "Frontend linting failed"
fi
cd ..

print_check "Checking for Prettier configuration..."
if [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ] || [ -f ".prettierrc.js" ] || [ -f "prettier.config.js" ]; then
    print_success "Prettier configuration found"
else
    print_warning "Prettier configuration not found"
fi

# 4. Type Checking
print_header "5️⃣  Type Checking"

print_check "Type checking frontend..."
cd frontend
if npx tsc --noEmit > /dev/null 2>&1; then
    print_success "Frontend type check passed"
else
    print_error "Frontend type check failed"
fi
cd ..

print_check "Type checking backend..."
cd backend
if npx tsc --noEmit > /dev/null 2>&1; then
    print_success "Backend type check passed"
else
    print_error "Backend type check failed"
fi
cd ..

# 5. Build
print_header "8️⃣  Build Process"

print_check "Building frontend..."
cd frontend
if npm run build > /dev/null 2>&1; then
    print_success "Frontend build succeeded"
    if [ -d ".next" ]; then
        print_success "Frontend build output (.next/) exists"
    fi
else
    print_error "Frontend build failed"
fi
cd ..

# 6. Configuration Files
print_header "⚙️  Configuration Files"

print_check "Checking for .editorconfig..."
if [ -f ".editorconfig" ]; then
    print_success ".editorconfig exists"
else
    print_warning ".editorconfig not found (recommended)"
fi

print_check "Checking for .env.example..."
if [ -f ".env.example" ]; then
    print_success ".env.example exists"
else
    print_warning ".env.example not found (recommended)"
fi

print_check "Checking for .gitignore..."
if [ -f ".gitignore" ]; then
    print_success ".gitignore exists"
    if grep -q "node_modules" .gitignore; then
        print_success "node_modules is gitignored"
    else
        print_warning "node_modules not in .gitignore"
    fi
    if grep -q "\.env" .gitignore; then
        print_success ".env is gitignored"
    else
        print_warning ".env not in .gitignore"
    fi
else
    print_error ".gitignore not found"
fi

# 7. Pre-commit Hooks
print_header "7️⃣  Pre-Commit Hooks"

print_check "Checking for pre-commit configuration..."
if [ -f ".pre-commit-config.yaml" ]; then
    print_success ".pre-commit-config.yaml exists"
    
    if command -v pre-commit &> /dev/null; then
        print_check "Running pre-commit hooks..."
        if pre-commit run --all-files > /dev/null 2>&1; then
            print_success "Pre-commit hooks passed"
        else
            print_error "Pre-commit hooks failed"
        fi
    else
        print_warning "pre-commit not installed (run: pip install pre-commit)"
    fi
else
    print_warning ".pre-commit-config.yaml not found"
fi

# 8. CI/CD Configuration
print_header "🤖 CI/CD"

print_check "Checking for GitHub Actions workflow..."
if [ -f ".github/workflows/ci.yml" ] || [ -f ".github/workflows/ci.yaml" ]; then
    print_success "GitHub Actions CI workflow exists"
else
    print_warning "GitHub Actions CI workflow not found"
fi

# 9. Secrets Detection
print_header "🔐 Secrets & Security"

print_check "Scanning for potential secrets in git history..."
if git log --all -p -S 'password|secret|key' -- . 2>/dev/null | grep -iE "(password|secret|api.key|api_key)" > /dev/null 2>&1; then
    print_warning "Potential secrets found in git history - manual review recommended"
else
    print_success "No obvious secrets found in git history"
fi

print_check "Checking for committed .env files..."
if git ls-files | grep -E "\.env$" > /dev/null 2>&1; then
    print_error ".env file is committed (should be in .gitignore)"
else
    print_success "No .env files committed"
fi

# Summary
print_header "📊 Summary"

TOTAL_CHECKS=$((CHECKS_PASSED + CHECKS_FAILED + CHECKS_WARNED))
echo -e "${GREEN}✓ Passed:${NC}  $CHECKS_PASSED"
echo -e "${YELLOW}⚠ Warnings:${NC} $CHECKS_WARNED"
echo -e "${RED}✗ Failed:${NC}  $CHECKS_FAILED"
echo -e "━━━━━━━━━━━━━━━━━━━"
echo -e "Total:     $TOTAL_CHECKS"

echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🚀 ALL SYSTEMS GO!                     ║${NC}"
    echo -e "${GREEN}║  Ready to push your first commit!       ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ PRE-FLIGHT CHECK FAILED              ║${NC}"
    echo -e "${RED}║  Please fix the errors above             ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════╝${NC}"
    exit 1
fi
