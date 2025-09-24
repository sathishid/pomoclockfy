# Use official Node.js runtime as base image
FROM --platform=$BUILDPLATFORM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the entire project (including public folder)
COPY . .

# Build the React app for production
RUN npm run build

# Use nginx to serve the built React app
FROM nginx:alpine

# Copy built React app to nginx html directory
COPY --from=0 /app/build /usr/share/nginx/html

# Copy custom nginx configuration (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]