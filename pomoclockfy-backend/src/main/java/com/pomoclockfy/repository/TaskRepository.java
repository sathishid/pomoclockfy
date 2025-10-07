package com.pomoclockfy.repository;

import com.pomoclockfy.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // Find tasks created between start and end date (for daily/weekly reports)
    List<Task> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Find tasks created on a specific date
    @Query("SELECT t FROM Task t WHERE DATE(t.createdAt) = DATE(:date)")
    List<Task> findByCreatedDate(@Param("date") LocalDateTime date);
    
    // Find tasks ordered by creation date (most recent first)
    List<Task> findAllByOrderByCreatedAtDesc();
    
    // Find tasks by task name (for searching)
    List<Task> findByTaskNameContainingIgnoreCase(String taskName);
    
    // Get total duration for today
    @Query("SELECT COALESCE(SUM(t.duration), 0) FROM Task t WHERE DATE(t.createdAt) = CURRENT_DATE")
    Integer getTotalDurationForToday();
    
    // Get total duration for a specific date
    @Query("SELECT COALESCE(SUM(t.duration), 0) FROM Task t WHERE DATE(t.createdAt) = DATE(:date)")
    Integer getTotalDurationForDate(@Param("date") LocalDateTime date);
}