# RIFQ Muslim - production image.
# Builds the React Native (Expo) web bundle and serves it together with the
# shared JSON API from a single Alpine Node container.
# syntax=docker/dockerfile:1

# ---------------------------------------------------------------- web bundle
FROM node:24-alpine AS webbuild
WORKDIR /app/mobile
COPY mobile/package.json mobile/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY mobile/ ./
# The browser build talks to the same origin that serves it.
ENV EXPO_PUBLIC_API_URL=""
ENV CI=1
RUN npx expo export --platform web --output-dir dist

# ------------------------------------------------------------------ runtime
FROM node:24-alpine AS runtime
RUN echo "os-refresh 2026-11-20" && apk upgrade --no-cache
ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/app/data
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force
COPY server/ ./server/
COPY --from=webbuild /app/mobile/dist ./server/public/
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]
