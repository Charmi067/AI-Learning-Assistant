FROM node:20

WORKDIR /app

# Step 1: copy only dependency files (IMPORTANT for caching)
COPY package.json package-lock.json ./

# Step 2: install dependencies with caching + speed flags
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline --no-audit --no-fund

# Step 3: copy rest of the app
COPY . .

# Step 4: start app
CMD ["npm", "start"]
