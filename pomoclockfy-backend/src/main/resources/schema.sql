-- Create database if not exists
CREATE DATABASE IF NOT EXISTS pomoclockfy_db;
USE pomoclockfy_db;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    session_type ENUM('WORK', 'BREAK', 'LONG_BREAK') NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    duration INT NOT NULL,
    project VARCHAR(255),
    tags JSON,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_time INT NOT NULL DEFAULT 25,
    break_time INT NOT NULL DEFAULT 5,
    long_break_time INT NOT NULL DEFAULT 15,
    sessions_completed INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Insert default settings if not exists
INSERT IGNORE INTO settings (id, work_time, break_time, long_break_time, sessions_completed, created_at, updated_at)
VALUES (1, 25, 5, 15, 0, NOW(), NOW());