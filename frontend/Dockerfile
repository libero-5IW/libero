FROM --platform=linux/arm64 node:20-slim

WORKDIR /app/frontend

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g vite

CMD sh -c "npm run dev"

EXPOSE 5173