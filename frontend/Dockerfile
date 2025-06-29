FROM node:20-alpine

WORKDIR /app/frontend

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

#dev
# RUN npm install -g vite
# CMD sh -c "npm run dev"

#prod
RUN npm run build
# Installer un serveur statique léger pour servir les fichiers
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]

EXPOSE 5173