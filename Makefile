.PHONY: help dev build start lint type-check gate clean install test

# Default target
help:
	@echo "December - Makefile Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install      Install all dependencies (frontend + backend)"
	@echo "  make dev          Start dev servers (frontend + backend)"
	@echo "  make build        Build production bundles"
	@echo ""
	@echo "Quality Checks:"
	@echo "  make lint         Run linters on all code"
	@echo "  make type-check   Run TypeScript type checking"
	@echo "  make gate         Run all excellence gate checks locally"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean        Clean build artifacts and dependencies"
	@echo "  make test         Run all tests"
	@echo ""

# Development
install:
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm ci
	@echo "📦 Installing backend dependencies..."
	@cd backend && bun install
	@echo "✅ All dependencies installed"

dev:
	@echo "🚀 Starting development servers..."
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8080"
	@cd frontend && npm run dev & cd backend && bun run src/index.ts

build:
	@echo "🏗️  Building production bundles..."
	@cd frontend && npm run build
	@echo "✅ Build complete"

start:
	@echo "🚀 Starting production servers..."
	@cd frontend && npm start & cd backend && bun run src/index.ts

# Quality Checks
lint:
	@echo "🔍 Running linters..."
	@cd frontend && npm run lint
	@echo "✅ Lint passed"

type-check:
	@echo "🔍 Running TypeScript type checking..."
	@cd frontend && npm run type-check
	@echo "✅ Type check passed"

depcheck:
	@echo "🔍 Checking for unused dependencies..."
	@cd frontend && npx depcheck --ignore-bin-package --skip-missing
	@echo "✅ Dependency check complete"

gate:
	@echo "🚦 Running December excellence gate..."
	@./scripts/fix-december.sh

# Docker
docker-build:
	@echo "🐳 Building Docker image..."
	@docker build -t december:latest -f Dockerfile .
	@echo "✅ Docker image built"

docker-run:
	@echo "🐳 Running Docker container..."
	@docker run -p 3000:3000 -p 8080:8080 december:latest

# Utilities
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf frontend/.next
	@rm -rf frontend/node_modules
	@rm -rf backend/node_modules
	@rm -rf dist
	@echo "✅ Clean complete"

test:
	@echo "🧪 Running tests..."
	@echo "⚠️  No tests configured yet"

# Git helpers
status:
	@git status --short

commit:
	@echo "📝 Creating commit..."
	@git add -A
	@git status --short
	@echo ""
	@read -p "Commit message: " msg; git commit -m "$$msg"

push: gate
	@echo "⬆️  Pushing to remote..."
	@git push

# Quick shortcuts
i: install
d: dev
l: lint
t: type-check
g: gate
