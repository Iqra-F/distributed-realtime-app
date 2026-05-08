FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000
RUN npx prisma generate 
CMD ["npx", "nodemon", "index.js"]