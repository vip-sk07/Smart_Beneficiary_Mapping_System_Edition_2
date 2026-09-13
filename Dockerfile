FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package files & prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate prisma client
RUN npm install
RUN npx prisma generate

# Copy application files
COPY tsconfig.json ./
COPY src ./src/
COPY scripts ./scripts/

# Expose default container ports
EXPOSE 10000
EXPOSE 3002

# Run WhatsApp Gateway daemon
CMD ["npm", "run", "whatsapp"]
