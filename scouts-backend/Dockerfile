# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml* ./

RUN pnpm install --frozen-lockfile

COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN pnpm build

# Stage 2: Production runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml* ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 3001

CMD ["node", "dist/main"]
