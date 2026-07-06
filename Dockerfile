# Build Stage
FROM node:lts-alpine AS builder
WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .
RUN npm run build

# Deploy Stage
FROM nginx:mainline-alpine-slim AS production
ENV NODE_ENV=production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 6069
CMD ["nginx", "-g", "daemon off;"]