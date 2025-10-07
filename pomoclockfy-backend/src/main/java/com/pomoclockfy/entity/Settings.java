package com.pomoclockfy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "settings")
public class Settings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Work time is required")
    @Min(value = 1, message = "Work time must be at least 1 minute")
    @Column(nullable = false)
    private Integer workTime = 25; // minutes
    
    @NotNull(message = "Break time is required")
    @Min(value = 1, message = "Break time must be at least 1 minute")
    @Column(nullable = false)
    private Integer breakTime = 5; // minutes
    
    @NotNull(message = "Long break time is required")
    @Min(value = 1, message = "Long break time must be at least 1 minute")
    @Column(nullable = false)
    private Integer longBreakTime = 15; // minutes
    
    @Column(nullable = false)
    private Integer sessionsCompleted = 0;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public Settings() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Settings(Integer workTime, Integer breakTime, Integer longBreakTime) {
        this();
        this.workTime = workTime;
        this.breakTime = breakTime;
        this.longBreakTime = longBreakTime;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Integer getWorkTime() {
        return workTime;
    }
    
    public void setWorkTime(Integer workTime) {
        this.workTime = workTime;
    }
    
    public Integer getBreakTime() {
        return breakTime;
    }
    
    public void setBreakTime(Integer breakTime) {
        this.breakTime = breakTime;
    }
    
    public Integer getLongBreakTime() {
        return longBreakTime;
    }
    
    public void setLongBreakTime(Integer longBreakTime) {
        this.longBreakTime = longBreakTime;
    }
    
    public Integer getSessionsCompleted() {
        return sessionsCompleted;
    }
    
    public void setSessionsCompleted(Integer sessionsCompleted) {
        this.sessionsCompleted = sessionsCompleted;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}