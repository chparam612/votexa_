FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/
COPY apps/frontend/lib/ ./apps/frontend/lib/
COPY apps/frontend/services/ ./apps/frontend/services/
RUN npm install --legacy-peer-deps --ignore-scripts
WORKDIR /app/packages/algorithms
RUN npx tsc
WORKDIR /app/apps/backend
RUN npx tsc
WORKDIR /app
CMD ["node", "apps/backend/dist/apps/backend/src/index.js"]