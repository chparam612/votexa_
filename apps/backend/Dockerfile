# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies including devDependencies (needed for tsc)
RUN npm install --no-package-lock

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production
FROM node:20-slim AS production

WORKDIR /usr/src/app

COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --omit=dev --no-package-lock


# Cloud Run uses PORT env variable
ENV PORT=8080
EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
