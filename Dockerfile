FROM node:22-alpine
RUN apk upgrade --no-cache
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY app.js ./
USER node
EXPOSE 3000
CMD ["node", "app.js"]
