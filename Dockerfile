# Multi-Stage Production Dockerfile for LifePulse Blood Donor Management System

# Stage 1: Build the React frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS server-runner
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# Copy server application source
COPY server/ ./

# Copy compiled frontend assets from Stage 1 into client/dist
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose server port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "index.js"]
