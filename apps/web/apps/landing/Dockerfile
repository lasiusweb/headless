# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/
COPY apps/web/apps/landing/package.json ./apps/web/apps/landing/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web/apps/landing ./apps/web/apps/landing
COPY apps/web/packages ./apps/web/packages
COPY packages ./packages

# Build landing page
RUN pnpm run build --filter=landing

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Set NODE_ENV
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files for production install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/
COPY apps/web/apps/landing/package.json ./apps/web/apps/landing/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts from builder
COPY --from=builder /app/apps/web/apps/landing/.next ./apps/web/apps/landing/.next
COPY --from=builder /app/apps/web/apps/landing/public ./apps/web/apps/landing/public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
WORKDIR /app/apps/web/apps/landing
CMD ["node", "server.js"]
