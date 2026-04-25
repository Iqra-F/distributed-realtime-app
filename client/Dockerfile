FROM node:20

WORKDIR /app

COPY package*.json ./

# 👇 force clean install (important)
RUN npm install --force

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]