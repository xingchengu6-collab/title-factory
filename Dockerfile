FROM node:22-alpine

WORKDIR /app
COPY . .

ENV NODE_ENV=production
RUN node scripts/generate-seo-pages.mjs

EXPOSE 4173
CMD ["node", "server.mjs"]
