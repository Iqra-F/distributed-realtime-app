# Use Node image from Docker Hub
# “Give me a machine with Node.js installed, version 18”
FROM node:20
# Inside container, create folder /app

WORKDIR /app

# Copy package files to install dependencies
COPY package*.json ./

# Install dependencies inside container
RUN npm install

# Copy your entire codebase into the container
COPY . .

# Expose port for the serve
EXPOSE 5000

# Start server in development mode

CMD ["npm", "run", "dev"]