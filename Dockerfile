# ---- deps ----
FROM node:24-alpine AS deps
WORKDIR /app
# better-sqlite3 설치 스크립트가 node-gyp rebuild 로 직접 컴파일한다 — 빠지면 npm ci 실패
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

# ---- run ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DB_PATH=/data/survey.db

# 이름 있는 볼륨은 처음 붙을 때 이미지의 /data 소유자를 물려받는다 → node 가 쓸 수 있게
RUN mkdir -p /data && chown node:node /data

# standalone 대신 node_modules 를 통째로 — 네이티브 모듈(better-sqlite3) 누락 방지
COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/next.config.mjs ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next

USER node
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
