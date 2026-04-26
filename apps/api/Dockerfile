FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# --- Build stage ---
FROM base AS build
WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# Copy all workspace packages needed for the build
COPY apps/api ./apps/api
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the api (turbo handles workspace dependency builds)
RUN pnpm turbo run build --filter=api

# --- Production stage ---
FROM base AS production
WORKDIR /app

# Copy root workspace files for pnpm
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy db package (migrations + drizzle config) for the start-time migrate step
COPY --from=build /app/packages/db ./packages/db

# Install only db dependencies (drizzle-kit for migrations)
RUN pnpm install --frozen-lockfile --filter=@repo/db

# Copy built API
COPY --from=build /app/apps/api/dist/index.js ./apps/api/index.js
COPY apps/api/start.sh ./apps/api/start.sh
RUN chmod +x ./apps/api/start.sh

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3001

CMD ["./start.sh"]
