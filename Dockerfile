# Use Node.js 22 Alpine for smaller image size
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (including devDependencies for tsx)
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build frontend
RUN pnpm run build

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the server
CMD ["pnpm", "start"]
