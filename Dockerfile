# Imagen oficial Node 20 slim
FROM node:20-slim

WORKDIR /app

# Instala dependencias primero (mejor cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copia el resto del código
COPY . .

# Railway inyecta PORT
ENV NODE_ENV=production

# Healthcheck simple
EXPOSE 3001

CMD ["node", "server.js"]