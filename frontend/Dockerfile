FROM node:18-alpine AS builder

WORKDIR /app

COPY . .
RUN npm install --frozen-lockfile
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/node_modules /app/node_modules

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]
