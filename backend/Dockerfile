# syntax=docker/dockerfile:1.6

FROM node:20

WORKDIR /app

# Step 1: copy dependency files first
COPY package.json package-lock.json ./

# Step 2: install dependencies (cached)
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# Step 3: copy source code
COPY . .

# Step 4: run server
CMD ["node", "server.js"]
