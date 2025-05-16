# Use official Node.js image as the base
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./

# Copy all files
RUN npm install

COPY . .

# Build Next.js app (artifacts/typechain will be mounted by docker-compose)
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"] 