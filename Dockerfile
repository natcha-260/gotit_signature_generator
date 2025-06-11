# Use nginx alpine image for minimal size
FROM nginx:alpine

# Copy the HTML file to nginx's default serve directory
COPY index.html /usr/share/nginx/html/

# Copy README.md if needed for documentation
COPY README.md /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
