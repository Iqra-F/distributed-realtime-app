# Use Node image from Docker Hub
# “Give me a machine with Node.js installed, version 18”
FROM node:20
# Inside container, create folder /app
# Everything runs inside this folder, it’s the root of our project in the container

WORKDIR /app

# Copy package files to install dependencies
COPY package*.json ./

# Install dependencies inside container
RUN npm install

# Copy your entire codebase into the container
COPY . .

# Expose port for the server
# “Hey Docker, the server will run on port 5000, so make sure to open that port for communication”
EXPOSE 5000

# Start server in development mode
# “Run npm run dev to start the server when the container starts”
CMD ["npm", "run", "dev"]