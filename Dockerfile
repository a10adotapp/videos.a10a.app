FROM node:20-alpine AS base

FROM base AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY . .

RUN npm install

RUN npx prisma generate

RUN npm run build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
