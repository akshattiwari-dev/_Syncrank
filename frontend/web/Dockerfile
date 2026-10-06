# syntax=docker/dockerfile:1
FROM node:20-slim AS build
WORKDIR /app
COPY frontend/web/package.json ./
RUN npm install --no-audit --no-fund
COPY frontend/web .
# VITE_API_URL is baked in at build time (Vite inlines import.meta.env.* into
# the static bundle) — must be passed as a build arg, not a runtime env var.
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY frontend/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
