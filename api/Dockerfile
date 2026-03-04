# Use Node.js 18 LTS alpine image
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy API source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the API server
CMD ["node", "index.js"]
