#!/bin/bash

# Build the Docker image
echo "Building Docker image..."
docker build -t signature-generator .

# Run the container
echo "Starting container on port 8080..."
docker run -d -p 8080:80 --name signature-generator-app signature-generator

echo "Application is now running at http://localhost:8080"
echo "To stop the container, run: docker stop signature-generator-app"
echo "To remove the container, run: docker rm signature-generator-app"
