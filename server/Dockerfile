# Use the official Node.js 14 image as base
FROM node:21
# Set the working directory in the container
WORKDIR /home/node/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN  npm i typescript -g 
RUN npm install


# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 4000

RUN npm run build


