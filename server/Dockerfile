FROM node:18-alpine as builder
COPY . ./app
WORKDIR /app
RUN npm install
RUN npm run build
RUN [ -f dist/server/index.js ]

FROM node:18-alpine as cleaner
COPY --from=builder /app/package*.json ./app/
COPY --from=builder /app/dist ./app/
WORKDIR /app
RUN npm ci --only=production

FROM gcr.io/distroless/nodejs:18 as final
COPY --from=cleaner /app ./app
WORKDIR /app

USER 1000

ENV PORT=8080
ENV NODE_ENV=production
ENV LOG_LEVEL=info

EXPOSE ${PORT}
CMD ["server/index.js"]
