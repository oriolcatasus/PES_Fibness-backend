# Use the official image as a parent image.
FROM node:12-slim

# Set the working directory.
WORKDIR /home/api

# Copy the file from your host to your current location.
COPY package*.json ./
COPY scripts ./scripts

# Run the command inside your image filesystem.
RUN chmod a+x scripts/*
RUN bash ./scripts/install_dependencies.sh

# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 3000

# Run the specified command within the container.
CMD bash ./scripts/start.sh

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .
