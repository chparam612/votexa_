FROM node:20-slim
WORKDIR /app

# Copy root config and dependency manifests
COPY package*.json ./
COPY tsconfig.json ./

# Copy packages and apps
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

# Install dependencies (ignoring scripts to avoid husky errors in CI)
RUN npm install --legacy-peer-deps --ignore-scripts

# Build algorithms package
WORKDIR /app/packages/algorithms
RUN npx tsc

# Build utils package
WORKDIR /app/packages/utils
RUN npx tsc

# Build backend
WORKDIR /app/apps/backend
RUN npx tsc

# Final run command
WORKDIR /app
CMD ["node", "apps/backend/dist/apps/backend/src/index.js"]