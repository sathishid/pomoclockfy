package com.pomoclockfy.repository;

import com.pomoclockfy.entity.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, Long> {
    
    // Since we typically have only one settings record per user,
    // we can find the first (and usually only) settings record
    Settings findFirstByOrderByIdAsc();
}