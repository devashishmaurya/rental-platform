# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy app and build (NEXT_PUBLIC_* can be passed as build-args)
COPY . .

# Build-time env for Next.js
# IMPORTANT: NEXT_PUBLIC_* variables are embedded at build time by Next.js
# Pass these as --build-arg during docker build or set in docker-compose.yml
# Defaults for realm/client are provided but URL must be passed
ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_KEYCLOAK_ADMIN_URL
ARG NEXT_PUBLIC_KEYCLOAK_REALM=rentsetu
ARG NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rentsetu-client
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL

# Set environment variables for Next.js build
# These will be embedded into the JavaScript bundle during npm run build
ENV NEXT_PUBLIC_KEYCLOAK_URL=${NEXT_PUBLIC_KEYCLOAK_URL}
ENV NEXT_PUBLIC_KEYCLOAK_ADMIN_URL=${NEXT_PUBLIC_KEYCLOAK_ADMIN_URL}
ENV NEXT_PUBLIC_KEYCLOAK_REALM=${NEXT_PUBLIC_KEYCLOAK_REALM}
ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=${NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Run stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
