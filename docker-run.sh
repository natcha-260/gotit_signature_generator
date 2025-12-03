#!/bin/bash

# Build and run Docker container for SHA256 Signature Generator

set -e

# Configuration
IMAGE_NAME="signature-generator"
CONTAINER_NAME="signature-generator-app"
PORT=3000

echo "🏗️  Building Docker image..."
docker build -t $IMAGE_NAME .

echo "🛑 Stopping existing container (if any)..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo "🚀 Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:80 \
  --restart unless-stopped \
  $IMAGE_NAME

echo "✅ Container started successfully!"
echo "📱 Application is running at: http://localhost:$PORT"
echo "🔍 Container logs: docker logs $CONTAINER_NAME"
echo "🛑 Stop container: docker stop $CONTAINER_NAME"