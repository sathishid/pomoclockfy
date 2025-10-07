package com.pomoclockfy.controller;

import com.pomoclockfy.entity.Task;
import com.pomoclockfy.repository.TaskRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000") // React dev server
public class TaskController {
    
    @Autowired
    private TaskRepository taskRepository;
    
    // Get all tasks
    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAllByOrderByCreatedAtDesc();
    }
    
    // Get task by ID
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Optional<Task> task = taskRepository.findById(id);
        return task.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // Create new task
    @PostMapping
    public Task createTask(@Valid @RequestBody Task task) {
        return taskRepository.save(task);
    }
    
    // Update task
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody Task taskDetails) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        
        if (optionalTask.isPresent()) {
            Task task = optionalTask.get();
            task.setTaskName(taskDetails.getTaskName());
            task.setSessionType(taskDetails.getSessionType());
            task.setStartTime(taskDetails.getStartTime());
            task.setEndTime(taskDetails.getEndTime());
            task.setDuration(taskDetails.getDuration());
            
            return ResponseEntity.ok(taskRepository.save(task));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Delete task
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Get tasks for today
    @GetMapping("/today")
    public List<Task> getTodayTasks() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        return taskRepository.findByCreatedAtBetween(startOfDay, endOfDay);
    }
    
    // Get total duration for today
    @GetMapping("/today/duration")
    public ResponseEntity<Integer> getTodayDuration() {
        Integer duration = taskRepository.getTotalDurationForToday();
        return ResponseEntity.ok(duration != null ? duration : 0);
    }
    
    // Search tasks by name
    @GetMapping("/search")
    public List<Task> searchTasks(@RequestParam String query) {
        return taskRepository.findByTaskNameContainingIgnoreCase(query);
    }
}