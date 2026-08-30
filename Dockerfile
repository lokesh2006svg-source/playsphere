# ==========================================
# 1. Base Node Image
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app

# ==========================================
# 2. Dependencies & Build Stage
# ==========================================
FROM base AS build
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY backend/ ./backend/
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# ==========================================
# 3. Production Runtime Stage
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=build /app/backend /app/backend
COPY --from=build /app/frontend/dist /app/frontend/dist

EXPOSE 5000

CMD ["node", "server.js"]
