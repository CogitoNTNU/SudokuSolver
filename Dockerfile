# Import official image from node
FROM node:20

# Change work directory
WORKDIR /website

# Copy npm package files
COPY package*.json ./

# Install node_modules
RUN npm i

# Copy next.js source code
COPY . .

# Open port 3000
EXPOSE 3000

# Run website
RUN npm run dev
