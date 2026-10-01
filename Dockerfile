# syntax=docker/dockerfile:1
# Build-Stage: Vue3/Vite/TS-App bauen (kein core, statische SPA)
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime-Stage: nginx serviert den gebauten Static-Build
FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8084
CMD ["nginx", "-g", "daemon off;"]
