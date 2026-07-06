FROM node:22-alpine

WORKDIR /app
COPY . .

ENV PORT=4173
RUN node scripts/generate-seo-pages.mjs

EXPOSE 4173
CMD ["node", "server.mjs"]
