# Multi-stage build for December mono-repo
FROM node:20.11.1-alpine AS base

# Install Bun
RUN apk add --no-cache curl bash
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# ---------- FRONTEND BUILD ----------
FROM base AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ ./
RUN npm ci --omit=dev
RUN npm run build

# ---------- BACKEND BUILD ----------
FROM base AS backend-builder
WORKDIR /app/backend
COPY backend/ ./
RUN bun install --production

# ---------- FINAL STAGE ----------
FROM node:20.11.1-alpine AS runner
RUN apk add --no-cache curl bash
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

# Copy backend
COPY --from=backend-builder /app/backend ./backend

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:3000/ || exit 1

# Default command (can be overridden)
CMD ["sh", "-c", "cd frontend && npm start & cd backend && bun run src/index.ts"]
