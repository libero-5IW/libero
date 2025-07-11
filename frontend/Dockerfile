FROM node:20-alpine

WORKDIR /app/frontend

COPY package*.json ./

RUN npm install

COPY . .

#RUN npm install -g vite
EXPOSE 5173

CMD ["npm", "run", "dev"]

