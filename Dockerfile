FROM node:20-alpine

WORKDIR /website

# Copy npm package files
COPY website/package*.json ./

# install dependencies
RUN npm ci

COPY /website/prisma ./prisma

RUN npx prisma generate

# Copy source code
COPY /website/ .

RUN npx prisma migrate reset

# Specify the command to run the Next.js development server
CMD ["npm", "run", "dev"]