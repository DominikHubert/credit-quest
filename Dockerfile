# Build Stage
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime Stage
FROM node:20-alpine
WORKDIR /app

# Copy server deps
COPY package*.json ./
RUN npm install --production
# We need to manually install express/cors/body-parser if they are devDeps, 
# or ensure they are in dependencies. 
# Safe bet: install them explicitly or copy node_modules if we controlled that.
# Better: Just run npm install in 'server' folder if it was separate, but it's root level mixed.
# Let's clean install production deps.

# Copy built frontend
COPY --from=builder /app/dist /app/dist

# Copy server code
COPY server /app/server

# Expose port
EXPOSE 80

# Start server
CMD ["node", "server/server.js"]
