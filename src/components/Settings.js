import React, { useState } from 'react';
import './Settings.css';

const Settings = ({
  workTime,
  breakTime,
  longBreakTime,
  onWorkTimeChange,
  onBreakTimeChange,
  onLongBreakTimeChange,
  onClose,
  onClearData,
  onExportData,
  totalTasks,
  todayTimeSpent
}) => {
  const [tempWorkTime, setTempWorkTime] = useState(workTime);
  const [tempBreakTime, setTempBreakTime] = useState(breakTime);
  const [tempLongBreakTime, setTempLongBreakTime] = useState(longBreakTime);

  const handleSave = () => {
    onWorkTimeChange(tempWorkTime);
    onBreakTimeChange(tempBreakTime);
    onLongBreakTimeChange(tempLongBreakTime);
    onClose();
  };

  const handleCancel = () => {
    setTempWorkTime(workTime);
    setTempBreakTime(breakTime);
    setTempLongBreakTime(longBreakTime);
    onClose();
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          <div className="setting-item">
            <label htmlFor="work-time">Work Time (minutes)</label>
            <input
              id="work-time"
              type="number"
              min="1"
              max="60"
              value={tempWorkTime}
              onChange={(e) => setTempWorkTime(parseInt(e.target.value) || 25)}
            />
          </div>
          
          <div className="setting-item">
            <label htmlFor="break-time">Short Break (minutes)</label>
            <input
              id="break-time"
              type="number"
              min="1"
              max="30"
              value={tempBreakTime}
              onChange={(e) => setTempBreakTime(parseInt(e.target.value) || 5)}
            />
          </div>
          
          <div className="setting-item">
            <label htmlFor="long-break-time">Long Break (minutes)</label>
            <input
              id="long-break-time"
              type="number"
              min="1"
              max="60"
              value={tempLongBreakTime}
              onChange={(e) => setTempLongBreakTime(parseInt(e.target.value) || 15)}
            />
          </div>
        </div>
        
        {/* Data Management Section */}
        <div className="data-management">
          <h4>Data Management</h4>
          <div className="data-stats">
            <p>📊 Total completed tasks: <strong>{totalTasks}</strong></p>
            <p>⏰ Time spent today: <strong>{todayTimeSpent}</strong></p>
            <p>💾 Data is automatically saved to your browser</p>
          </div>
          
          <div className="data-actions">
            <button className="export-btn" onClick={onExportData}>
              📥 Export Data
            </button>
            <button className="clear-btn" onClick={onClearData}>
              🗑️ Clear All Data
            </button>
          </div>
        </div>
        
        <div className="settings-footer">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;