# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/
COPY apps/web/apps/www/package.json ./apps/web/apps/www/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web/apps/www ./apps/web/apps/www
COPY apps/web/packages ./apps/web/packages
COPY packages ./packages

# Build B2B portal
RUN pnpm run build --filter=www

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Set NODE_ENV
ENV NODE_ENV=production
ENV PORT=3001

# Copy package files for production install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/
COPY apps/web/apps/www/package.json ./apps/web/apps/www/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts from builder
COPY --from=builder /app/apps/web/apps/www/.next ./apps/web/apps/www/.next
COPY --from=builder /app/apps/web/apps/www/public ./apps/web/apps/www/public

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
WORKDIR /app/apps/web/apps/www
CMD ["node", "server.js"]
