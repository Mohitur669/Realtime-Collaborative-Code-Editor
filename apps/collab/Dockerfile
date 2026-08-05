FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm turbo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @codesync/collab build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 1234
CMD ["node", "apps/collab/dist/index.js"]
