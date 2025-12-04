# Use a Node base image for building
FROM node:20-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Use a lightweight Nginx image to serve the static files
FROM nginx:stable-alpine as production

# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx config if needed for SPA routing (e.g., if you use React Router)
# COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]