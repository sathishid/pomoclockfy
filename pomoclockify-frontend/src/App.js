import React, { useState, useEffect } from 'react';
import './App.css';
import Timer from './components/Timer';
import Settings from './components/Settings';

function App() {
  const [workTime, setWorkTime] = useState(25); // minutes
  const [breakTime, setBreakTime] = useState(5); // minutes
  const [longBreakTime, setLongBreakTime] = useState(15); // minutes
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState('work'); // 'work', 'break', 'longBreak'
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [timerKey, setTimerKey] = useState(0);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('pomoclockfy-tasks');
    const savedSettings = localStorage.getItem('pomoclockfy-settings');
    
    if (savedTasks) {
      try {
        const tasks = JSON.parse(savedTasks);
        // Convert date strings back to Date objects
        const tasksWithDates = tasks.map(task => ({
          ...task,
          startTime: new Date(task.startTime),
          endTime: new Date(task.endTime)
        }));
        setCompletedTasks(tasksWithDates);
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
      }
    }

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setWorkTime(settings.workTime || 25);
        setBreakTime(settings.breakTime || 5);
        setLongBreakTime(settings.longBreakTime || 15);
        setSessionsCompleted(settings.sessionsCompleted || 0);
      } catch (error) {
        console.error('Error loading settings from localStorage:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever completedTasks changes
  useEffect(() => {
    if (completedTasks.length > 0) {
      localStorage.setItem('pomoclockfy-tasks', JSON.stringify(completedTasks));
    }
  }, [completedTasks]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      workTime,
      breakTime,
      longBreakTime,
      sessionsCompleted
    };
    localStorage.setItem('pomoclockfy-settings', JSON.stringify(settings));
  }, [workTime, breakTime, longBreakTime, sessionsCompleted]);

  const getCurrentSessionTime = () => {
    switch (currentSession) {
      case 'work':
        return workTime;
      case 'break':
        return breakTime;
      case 'longBreak':
        return longBreakTime;
      default:
        return workTime;
    }
  };

  const handleSessionComplete = () => {
    if (currentSession === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      // Every 4 work sessions, take a long break
      if (newSessionsCompleted % 4 === 0) {
        setCurrentSession('longBreak');
      } else {
        setCurrentSession('break');
      }
    } else {
      setCurrentSession('work');
    }
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentSession('work');
    setSessionsCompleted(0);
    setStartTime(null);
    setTimerKey(prev => prev + 1); // Force timer reset
  };

  const handleToggleTimer = () => {
    if (!isRunning && !startTime) {
      setStartTime(new Date());
    }
    setIsRunning(!isRunning);
  };

  const handleSessionTypeChange = (sessionType) => {
    if (!isRunning) {
      setCurrentSession(sessionType);
    }
  };

    const handleMarkDone = () => {
    if (currentTask.trim() && startTime) {
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / (1000 * 60)); // duration in minutes
      
      const completedTask = {
        id: Date.now(),
        task: currentTask.trim(),
        sessionType: currentSession,
        startTime: startTime,
        endTime: endTime,
        duration: duration
      };
      
      setCompletedTasks(prev => [completedTask, ...prev]);
      setCurrentTask('');
      setIsRunning(false);
      setStartTime(null);
      setTimerKey(prev => prev + 1); // Force timer reset
    }
  };

  const handleDuplicateTask = (taskName) => {
    if (!isRunning) {
      setCurrentTask(taskName);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task from history?')) {
      setCompletedTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const getTodayTimeSpent = () => {
    const today = new Date().toDateString();
    const todayTasks = completedTasks.filter(task => 
      task.endTime.toDateString() === today
    );
    const totalMinutes = todayTasks.reduce((sum, task) => sum + task.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all task history and reset settings? This cannot be undone.')) {
      setCompletedTasks([]);
      setWorkTime(25);
      setBreakTime(5);
      setLongBreakTime(15);
      setSessionsCompleted(0);
      localStorage.removeItem('pomoclockfy-tasks');
      localStorage.removeItem('pomoclockfy-settings');
    }
  };

  const handleExportData = () => {
    const data = {
      tasks: completedTasks,
      settings: {
        workTime,
        breakTime,
        longBreakTime,
        sessionsCompleted
      },
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pomoclockfy-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`App ${currentSession}`}>
      <header className="App-header">
        <h1>Pomoclockfy</h1>
        <p className="subtitle">Stay focused, stay productive</p>
      </header>

      {/* Settings Button - Top Right Corner */}
      <button 
        className="settings-btn-corner"
        onClick={() => setShowSettings(!showSettings)}
        title="Settings"
      >
        ⚙️
      </button>
      
      <main className="main-content">
        <div className="app-layout">
          {/* Three Column Layout */}
          <div className="main-timer-section">
            {/* 1st Panel - Session Tabs & Task Input */}
            <div className="left-panel">
              <div className="session-tabs">
                <button
                  className={`session-tab ${currentSession === 'work' ? 'active' : ''}`}
                  onClick={() => handleSessionTypeChange('work')}
                  disabled={isRunning}
                >
                  Pomo
                </button>
                <button
                  className={`session-tab ${currentSession === 'break' ? 'active' : ''}`}
                  onClick={() => handleSessionTypeChange('break')}
                  disabled={isRunning}
                >
                  Short Break
                </button>
                <button
                  className={`session-tab ${currentSession === 'longBreak' ? 'active' : ''}`}
                  onClick={() => handleSessionTypeChange('longBreak')}
                  disabled={isRunning}
                >
                  Long Break
                </button>
              </div>

              <div className="task-section">
                <input
                  type="text"
                  className="task-input"
                  placeholder="What are you working on?"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  disabled={isRunning}
                />
              </div>

              <div className="session-info">
                <p>Sessions completed: {sessionsCompleted}</p>
                {startTime && (
                  <p>Started at: {startTime.toLocaleTimeString()}</p>
                )}
              </div>
            </div>

            {/* 2nd Panel - Timer Circle */}
            <div className="center-panel">
              <Timer
                key={timerKey}
                initialTime={getCurrentSessionTime()}
                isRunning={isRunning}
                onToggle={handleToggleTimer}
                onReset={resetTimer}
                onComplete={handleSessionComplete}
                sessionType={currentSession}
                currentTask={currentTask}
                startTime={startTime}
              />
            </div>

            {/* 3rd Panel - Control Buttons */}
            <div className="right-panel">
              <div className="control-buttons">
                <button 
                  className={`play-pause-btn ${isRunning ? 'pause' : 'play'}`}
                  onClick={handleToggleTimer}
                >
                  {isRunning ? '⏸️' : '▶️'}
                </button>
                
                <button className="reset-btn" onClick={resetTimer}>
                  🔄
                </button>

                {currentTask.trim() && startTime && (
                  <button 
                    className="done-btn"
                    onClick={handleMarkDone}
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Task History Section */}
        {completedTasks.length > 0 && (
          <div className="task-history">
            <div className="history-header">
              <h3>Completed Tasks</h3>
              <div className="daily-stats">
                <span className="today-time">Today: {getTodayTimeSpent()}</span>
              </div>
            </div>
            <div className="task-list">
              {completedTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <div className="task-name">{task.task}</div>
                    <div className="task-type">
                      {task.sessionType === 'work' ? 'Pomo' : 
                       task.sessionType === 'break' ? 'Short Break' : 'Long Break'}
                    </div>
                  </div>
                  <div className="task-times">
                    <div className="start-time">{task.startTime.toLocaleTimeString()}</div>
                    <div className="end-time">{task.endTime.toLocaleTimeString()}</div>
                    <div className="duration">{task.duration} min</div>
                  </div>
                  <div className="task-actions">
                    <button 
                      className="duplicate-btn"
                      onClick={() => handleDuplicateTask(task.task)}
                      disabled={isRunning}
                      title="Start new session with this task"
                    >
                      🔄 Start New
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete this task from history"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSettings && (
          <Settings
            workTime={workTime}
            breakTime={breakTime}
            longBreakTime={longBreakTime}
            onWorkTimeChange={setWorkTime}
            onBreakTimeChange={setBreakTime}
            onLongBreakTimeChange={setLongBreakTime}
            onClose={() => setShowSettings(false)}
            onClearData={handleClearAllData}
            onExportData={handleExportData}
            totalTasks={completedTasks.length}
            todayTimeSpent={getTodayTimeSpent()}
          />
        )}
      </main>
    </div>
  );
}

export default App;