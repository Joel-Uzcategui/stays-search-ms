FROM node:22.23.4-alpine AS base

WORKDIR /usr/src/app

FROM base AS deps

COPY package*.json ./
RUN npm ci

FROM base AS build

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM base AS runtime

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /usr/src/app/dist ./dist

USER node

CMD ["node", "dist/main"]
