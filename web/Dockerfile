# AssignMe web — local-device image (Next.js standalone + Prisma migrate on boot).
FROM node:24-alpine AS deps
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
# Tolerate slow/flaky container egress (seen as `npm error network`).
ENV NPM_CONFIG_FETCH_RETRIES=5 NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

FROM node:24-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# prisma generate needs DATABASE_URL present in prisma.config.ts (no DB connection at build).
ENV DATABASE_URL=postgresql://assignme:assignme@localhost:5432/assignme
RUN npx prisma generate && npm run build

FROM node:24-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Full node_modules: prisma CLI needs its hoisted deps for `migrate deploy`.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/package.json ./
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Direct node invoke: runner has no node_modules/.bin on PATH and npx would hit the registry.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
