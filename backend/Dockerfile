# FROM --platform=linux/arm64 node:20-slim
FROM node:20-slim

RUN apt-get update && apt-get install -y \
    chromium \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    libgbm1 \ 
    --no-install-recommends \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# MISE EN PROD: NODE_ENV=development -> NODE_ENV=production
ENV NODE_ENV=development

WORKDIR /app/backend

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma migrate
RUN npx prisma generate

EXPOSE 3000 5555
# MISE EN PROD: npm run start:dev -> npm run start:prod 
CMD sh -c "nohup npx prisma studio --port 5555 & npm run start:dev"

