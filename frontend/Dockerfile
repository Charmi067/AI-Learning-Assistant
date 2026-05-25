FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline --no-audit --no-fund

COPY . .

# Add these 2 lines ↓
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

CMD ["npm", "start"]