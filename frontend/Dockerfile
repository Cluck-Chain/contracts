# Use official Node.js image as the base
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
#COPY frontend/package*.json ./

# Copy all files
COPY frontend .
RUN npm install

# Copy shared artifacts and typechain-types into the image
COPY shared/artifacts ./artifacts
COPY shared/typechain-types ./typechain-types
COPY shared/deployed.json ./deployed.json

# Build Next.js app (artifacts/typechain will be mounted by docker-compose)
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"] 