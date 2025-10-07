package com.pomoclockfy.controller;

import com.pomoclockfy.entity.Settings;
import com.pomoclockfy.repository.SettingsRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:3000") // React dev server
public class SettingsController {
    
    @Autowired
    private SettingsRepository settingsRepository;
    
    // Get current settings (creates default if none exist)
    @GetMapping
    public Settings getSettings() {
        Settings settings = settingsRepository.findFirstByOrderByIdAsc();
        if (settings == null) {
            // Create default settings if none exist
            settings = new Settings();
            settings = settingsRepository.save(settings);
        }
        return settings;
    }
    
    // Update settings
    @PutMapping
    public Settings updateSettings(@Valid @RequestBody Settings settingsDetails) {
        Settings settings = settingsRepository.findFirstByOrderByIdAsc();
        
        if (settings == null) {
            // Create new settings if none exist
            settings = new Settings();
        }
        
        settings.setWorkTime(settingsDetails.getWorkTime());
        settings.setBreakTime(settingsDetails.getBreakTime());
        settings.setLongBreakTime(settingsDetails.getLongBreakTime());
        settings.setSessionsCompleted(settingsDetails.getSessionsCompleted());
        
        return settingsRepository.save(settings);
    }
    
    // Reset settings to default
    @PostMapping("/reset")
    public Settings resetSettings() {
        Settings settings = settingsRepository.findFirstByOrderByIdAsc();
        
        if (settings == null) {
            settings = new Settings();
        } else {
            settings.setWorkTime(25);
            settings.setBreakTime(5);
            settings.setLongBreakTime(15);
            settings.setSessionsCompleted(0);
        }
        
        return settingsRepository.save(settings);
    }
    
    // Increment session count
    @PostMapping("/increment-session")
    public ResponseEntity<Settings> incrementSession() {
        Settings settings = settingsRepository.findFirstByOrderByIdAsc();
        
        if (settings == null) {
            settings = new Settings();
        }
        
        settings.setSessionsCompleted(settings.getSessionsCompleted() + 1);
        Settings updatedSettings = settingsRepository.save(settings);
        
        return ResponseEntity.ok(updatedSettings);
    }
}