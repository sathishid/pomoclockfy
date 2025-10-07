# Pomoclockfy Backend API

A Spring Boot REST API backend for the Pomoclockfy Pomodoro timer application with MySQL database persistence.

## Features

- 🎯 **Task Management**: Create, read, update, delete Pomodoro tasks
- ⚙️ **Settings Management**: Manage timer settings (work/break durations)
- 📊 **Analytics**: Track daily time spent and session counts
- 🔄 **Cross-Origin Support**: CORS configured for React frontend
- 🗄️ **MySQL Integration**: Persistent data storage

## Project Structure

```
src/main/java/com/pomoclockfy/
├── PomoclockfyBackendApplication.java    # Main Spring Boot application
├── config/
│   └── CorsConfig.java                   # CORS configuration
├── controller/
│   ├── TaskController.java               # Task REST endpoints
│   └── SettingsController.java           # Settings REST endpoints
├── entity/
│   ├── Task.java                         # Task JPA entity
│   ├── Settings.java                     # Settings JPA entity
│   └── SessionType.java                  # Session type enum
└── repository/
    ├── TaskRepository.java               # Task data access
    └── SettingsRepository.java           # Settings data access
```

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher
- VS Code with Java Extension Pack

## Setup Instructions

### 1. Database Setup

Create a MySQL database and user:

```sql
CREATE DATABASE pomoclockfy_db;
CREATE USER 'pomoclockfy'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON pomoclockfy_db.* TO 'pomoclockfy'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configuration

Update `src/main/resources/application.properties` with your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pomoclockfy_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Build and Run

```bash
# Build the project
mvn clean compile

# Run the application
mvn spring-boot:run

# Or run with Maven wrapper (if available)
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks (ordered by creation date, newest first)
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/today` - Get today's tasks
- `GET /api/tasks/today/duration` - Get total duration for today
- `GET /api/tasks/search?query=text` - Search tasks by name

### Settings

- `GET /api/settings` - Get current settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/reset` - Reset settings to default
- `POST /api/settings/increment-session` - Increment session count

## Example API Usage

### Create a Task

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Review code",
    "sessionType": "WORK",
    "startTime": "2023-12-07T10:00:00",
    "endTime": "2023-12-07T10:25:00",
    "duration": 25
  }'
```

### Update Settings

```bash
curl -X PUT http://localhost:8080/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "workTime": 30,
    "breakTime": 5,
    "longBreakTime": 20,
    "sessionsCompleted": 5
  }'
```

## Database Schema

### Tasks Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| task_name | VARCHAR(255) | Task description |
| session_type | ENUM | WORK, BREAK, LONG_BREAK |
| start_time | DATETIME | Session start time |
| end_time | DATETIME | Session end time |
| duration | INT | Duration in minutes |
| created_at | DATETIME | Record creation time |
| updated_at | DATETIME | Record update time |

### Settings Table

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | BIGINT | | Primary key |
| work_time | INT | 25 | Work session minutes |
| break_time | INT | 5 | Break session minutes |
| long_break_time | INT | 15 | Long break minutes |
| sessions_completed | INT | 0 | Total sessions completed |
| created_at | DATETIME | | Record creation time |
| updated_at | DATETIME | | Record update time |

## Frontend Integration

This backend is designed to work with the Pomoclockfy React frontend. Update your React app to use this API:

```javascript
// Example: Save task to backend instead of localStorage
const saveTask = async (task) => {
  const response = await fetch('http://localhost:8080/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      taskName: task.task,
      sessionType: task.sessionType.toUpperCase(),
      startTime: task.startTime.toISOString(),
      endTime: task.endTime.toISOString(),
      duration: task.duration
    })
  });
  return response.json();
};
```

## Development

### Running Tests

```bash
mvn test
```

### Building for Production

```bash
mvn clean package
java -jar target/pomoclockfy-backend-0.0.1-SNAPSHOT.jar
```

### Hot Reload

The application supports hot reload with Spring Boot DevTools. Changes to Java files will automatically restart the application.

## Troubleshooting

1. **Database Connection Issues**: Verify MySQL is running and credentials are correct
2. **Port Conflicts**: Change `server.port` in `application.properties` if port 8080 is in use
3. **CORS Issues**: Frontend origins are configured in `CorsConfig.java`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## License

This project is licensed under the MIT License.