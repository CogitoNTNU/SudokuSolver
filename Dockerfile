# Use the official image as a parent image
FROM node:20 

# Set the working directory
WORKDIR /website

# Copy npm package files
COPY website/package*.json ./

# Run the command inside your image filesystem
RUN npm i

# Copy next.js source code
COPY /website .

EXPOSE 3000

# Run the specified command within the container.
RUN npx next dev
