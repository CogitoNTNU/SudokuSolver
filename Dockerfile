# Use the official image as a parent image
FROM node:20 

# Set the working directory
WORKDIR /website

# Copy npm package files
COPY website/package*.json ./

# Run the command inside your image filesystem
RUN npm ci

# Copy next.js source code
COPY /website .

# Specify the command to run the Next.js development server
CMD ["npm", "run", "dev"]