# Use the official image as a parent image
FROM node:20 

# Set the working directory
WORKDIR /website

# Copy the file from your host to your current location
COPY website/package*.json .

# Run the command inside your image filesystem
RUN npm i

# Inform Docker that the container is listening on the specified port at runtime.
COPY website/ .


EXPOSE 3000

# Run the specified command within the container.
RUN npm run dev
