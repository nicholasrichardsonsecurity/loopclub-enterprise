FROM node:22-slim AS builder
WORKDIR /app

# Install all dependencies (including dev) for build steps like Prisma generate
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# Copy source code and build the application
COPY . .
RUN npx prisma generate && npm run build

# Remove dev‑dependencies to keep the runtime image lightweight
RUN npm prune --production

# Runtime image
FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
ENV NODE_ENV=production
EXPOSE 3000
# Start the API, applying pending migrations first
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]