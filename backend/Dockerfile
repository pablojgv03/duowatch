FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl openssl-dev libc6-compat

FROM base AS deps
COPY package*.json ./
RUN npm install

FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
