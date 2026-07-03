FROM node:20-alpine

WORKDIR /app

# Install dependencies (production)
COPY package*.json ./
COPY patch-web-fetch.js ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build assets
RUN npm run build

EXPOSE 3000
CMD ["node", "server.js"]
