FROM node:alpine

LABEL version="1.0"
LABEL description="Code Editor."
LABEL maintainer=["mohitur669@gmail.com"]

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --production

COPY . .

# Set environment variables
ENV REACT_APP_BACKEND_URL=<your_backend_url>
ENV SERVER_PORT=<your_server_port>

# Expose the necessary ports
EXPOSE 5000
EXPOSE 8000
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start:docker"]