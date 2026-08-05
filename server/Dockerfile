FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package*.json ./

RUN mkdir -p /app/data

EXPOSE 4000

CMD ["node", "--experimental-sqlite", "src/index.js"]