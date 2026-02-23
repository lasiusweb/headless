# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/
COPY apps/web/apps/agriculture/package.json ./apps/web/apps/agriculture/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web/apps/agriculture ./apps/web/apps/agriculture
COPY apps/web/packages ./apps/web/packages
COPY packages ./packages

# Build B2C portal
RUN pnpm run build --filter=agriculture

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Set NODE_ENV
ENV NODE_ENV=production
ENV PORT=3002

# Copy package files for production install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/
COPY apps/web/apps/agriculture/package.json ./apps/web/apps/agriculture/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts from builder
COPY --from=builder /app/apps/web/apps/agriculture/.next ./apps/web/apps/agriculture/.next
COPY --from=builder /app/apps/web/apps/agriculture/public ./apps/web/apps/agriculture/public

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
WORKDIR /app/apps/web/apps/agriculture
CMD ["node", "server.js"]
