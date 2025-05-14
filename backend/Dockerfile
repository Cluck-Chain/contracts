FROM node:22-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create entrypoint script to ensure we can access the mounted volumes before starting
RUN echo -e '#!/bin/sh\necho "Starting backend after mounted volumes are available..."\nif [ -d "./src/contract-artifacts" ] && [ -d "./src/contract-typechain" ]; then\n  echo "Contract artifacts and typechain found."\nexec "$@"\nelse\n  echo "Error: Required contract artifacts or typechain not found in mounted volumes!"\n  exit 1\nfi' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Expose the backend port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Use entrypoint script to verify volumes are mounted correctly
ENTRYPOINT ["/app/entrypoint.sh"]

# Start the application
CMD ["node", "src/index.js"] 