# Pomoclockfy - Pomodoro Timer Application

A modern Pomodoro timer application built with React frontend and Spring Boot backend, designed to help you manage your time effectively using the Pomodoro Technique.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Docker Setup](#docker-setup)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## ✨ Features

- **Pomodoro Timer**: Work and break session timer
- **Task Management**: Create, update, and track tasks
- **Customizable Settings**: Configure work and break durations
- **Modern UI**: Clean and intuitive React-based interface
- **RESTful API**: Spring Boot backend with MySQL database
- **Cross-platform**: Web-based application accessible on any device

## 🔧 Prerequisites

Before running the application, ensure you have the following installed:

- **Java 17** or higher
- **Node.js 16** or higher
- **npm** or **yarn**
- **MySQL 8.0** or higher
- **Maven 3.6** or higher
- **Docker** (optional, for containerized deployment)

## 📥 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sathishid/pomoclockfy.git
   cd pomoclockfy
   ```

2. **Set up MySQL Database:**
   ```sql
   CREATE DATABASE pomoclockfy_db;
   CREATE USER 'root'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON pomoclockfy_db.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd pomoclockify-frontend
   npm install
   ```

4. **Install Backend Dependencies:**
   ```bash
   cd ../pomoclockfy-backend
   mvn clean install
   ```

## 🚀 Running the Application

### Method 1: Run Both Services Separately

#### 1. Start the Backend Server

```bash
cd pomoclockfy-backend
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

#### 2. Start the Frontend Development Server

```bash
cd pomoclockify-frontend
npm start
```

The frontend will start on `http://localhost:3000`

### Method 2: Production Build

#### 1. Build the Frontend

```bash
cd pomoclockify-frontend
npm run build
```

#### 2. Run the Backend

```bash
cd ../pomoclockfy-backend
mvn spring-boot:run
```

The application will be available at `http://localhost:8080`

### Method 3: Using Docker (Frontend Only)

```bash
cd pomoclockify-frontend
docker-compose up --build
```

The frontend will be available at `http://localhost:8080`

## 📁 Project Structure

```
pomoclockfy/
├── README.md
├── pomoclockfy-backend/          # Spring Boot Backend
│   ├── pom.xml
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/pomoclockfy/
│   │   │   │   ├── PomoclockfyBackendApplication.java
│   │   │   │   ├── config/       # Configuration classes
│   │   │   │   ├── controller/   # REST Controllers
│   │   │   │   ├── entity/       # JPA Entities
│   │   │   │   └── repository/   # Data Repositories
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── schema.sql
│   │   └── test/
│   └── target/
└── pomoclockify-frontend/        # React Frontend
    ├── package.json
    ├── Dockerfile
    ├── docker-compose.yml
    ├── public/
    ├── src/
    │   ├── App.js
    │   ├── components/           # React Components
    │   └── services/            # API Services
    └── build/
```

## ⚙️ Configuration

### Backend Configuration

Update `pomoclockfy-backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/pomoclockfy_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=password

# Server Configuration
server.port=8080

# CORS Configuration (handled in CorsConfig.java)
```

### Frontend Configuration

Update API endpoint in `pomoclockify-frontend/src/services/api.js` if needed:

```javascript
const API_BASE_URL = 'http://localhost:8080';
```

## 🐳 Docker Setup

### Frontend Docker Setup

The frontend includes Docker configuration:

```bash
cd pomoclockify-frontend
docker build -t pomoclockfy-frontend .
docker run -p 8080:80 pomoclockfy-frontend
```

### Full Stack Docker Setup (Coming Soon)

A complete Docker Compose setup for both frontend and backend will be added in future releases.

## 📡 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update user settings

## 🎯 Usage

1. **Access the Application**: Open your browser and navigate to `http://localhost:3000` (development) or `http://localhost:8080` (production)

2. **Create Tasks**: Add tasks you want to work on using the task management interface

3. **Configure Settings**: Adjust work and break durations in the settings panel

4. **Start Timer**: Begin your Pomodoro session and stay focused!

5. **Track Progress**: Monitor your completed tasks and sessions

## 🔧 Development

### Hot Reload Development

For development with hot reload:

```bash
# Terminal 1 - Backend
cd pomoclockfy-backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd pomoclockify-frontend
npm start
```

### Building for Production

```bash
# Build frontend
cd pomoclockify-frontend
npm run build

# Build backend
cd ../pomoclockfy-backend
mvn clean package
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**: Ensure MySQL is running and credentials are correct
2. **Port Already in Use**: Change the port in application.properties or stop conflicting services
3. **CORS Issues**: Check CorsConfig.java for proper frontend URL configuration
4. **Build Failures**: Ensure Java 17 and Node.js 16+ are installed

### Support

For support, please open an issue on GitHub or contact the development team.

---

**Happy Pomodoro-ing! 🍅**
