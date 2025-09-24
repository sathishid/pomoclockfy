# Pomoclockfy Docker Guide

## 🐳 Docker Setup

This guide shows you how to containerize and run your Pomoclockfy Pomodoro app using Docker.

## 📋 Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and run the container
docker-compose up --build

# Run in background (detached mode)
docker-compose up -d --build

# Stop the container
docker-compose down
```

### Option 2: Using Docker Commands

```bash
# Build the Docker image
docker build -t pomoclockfy .

# Run the container
docker run -d -p 3000:80 --name pomoclockfy-app pomoclockfy

# Stop the container
docker stop pomoclockfy-app

# Remove the container
docker rm pomoclockfy-app
```

## 🌐 Access Your App

Once running, access your Pomoclockfy app at:
- **Local**: http://localhost:3000
- **Network**: http://YOUR_IP:3000

## 📁 Docker Files Explained

### Dockerfile
- **Multi-stage build**: First stage builds the React app, second stage serves it with nginx
- **Node.js 18 Alpine**: Lightweight base image for building
- **Nginx Alpine**: Efficient web server for serving static files
- **Production optimized**: Only production dependencies included

### nginx.conf
- **SPA Support**: Handles React Router with `try_files`
- **Gzip Compression**: Reduces file sizes for faster loading
- **Security Headers**: Basic security improvements
- **Static Caching**: Caches assets for better performance

### .dockerignore
- **Excludes unnecessary files**: Reduces build context size
- **Skips development files**: Only includes production-needed files

### docker-compose.yml
- **Port Mapping**: Maps container port 80 to host port 3000
- **Auto-restart**: Container restarts if it crashes
- **Volume Mounting**: For custom nginx configuration

## 🔧 Customization

### Change Port
Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Change 3000 to 8080
```

### Custom Domain
Update `nginx.conf`:
```nginx
server_name yourdomain.com;
```

### Environment Variables
Add to `docker-compose.yml`:
```yaml
environment:
  - REACT_APP_API_URL=https://api.yourdomain.com
```

## 📊 Container Management

### View Logs
```bash
# Using docker-compose
docker-compose logs -f

# Using docker
docker logs -f pomoclockfy-app
```

### Update App
```bash
# Rebuild and restart
docker-compose up --build -d

# Or with docker commands
docker stop pomoclockfy-app
docker rm pomoclockfy-app
docker build -t pomoclockfy .
docker run -d -p 3000:80 --name pomoclockfy-app pomoclockfy
```

### Container Stats
```bash
# View resource usage
docker stats pomoclockfy-app
```

## 🚀 Production Deployment

### For Production Servers

1. **Copy files to server**:
```bash
scp -r . user@server:/path/to/pomoclockfy/
```

2. **Build and run on server**:
```bash
ssh user@server
cd /path/to/pomoclockfy/
docker-compose up -d --build
```

3. **Set up reverse proxy** (nginx/Apache) for custom domain

### For Cloud Platforms

#### Docker Hub
```bash
# Tag image
docker tag pomoclockfy username/pomoclockfy:latest

# Push to Docker Hub
docker push username/pomoclockfy:latest
```

#### AWS ECR
```bash
# Login to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin account.dkr.ecr.region.amazonaws.com

# Tag and push
docker tag pomoclockfy account.dkr.ecr.region.amazonaws.com/pomoclockfy:latest
docker push account.dkr.ecr.region.amazonaws.com/pomoclockfy:latest
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Check what's using port 3000
lsof -i :3000

# Or change port in docker-compose.yml
```

**Build fails**:
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**App not loading**:
- Check if container is running: `docker ps`
- Check logs: `docker-compose logs`
- Verify port mapping in docker-compose.yml

### Performance Tips

- Use Docker BuildKit for faster builds
- Multi-stage builds reduce final image size
- Nginx serves static files efficiently
- Gzip compression reduces bandwidth

## 📝 Notes

- **Data Persistence**: Your task history is stored in browser localStorage, not in the container
- **Scaling**: For multiple instances, consider external session storage
- **Security**: This setup is suitable for development and internal use
- **HTTPS**: For production, set up SSL/TLS termination at reverse proxy level

## 🎯 Next Steps

1. Set up CI/CD pipeline for automatic builds
2. Configure monitoring and logging
3. Implement health checks
4. Set up backup strategies for user data
5. Consider migrating to external database for multi-user support