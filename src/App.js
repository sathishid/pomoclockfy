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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pomoclockfy</h1>
        <p className="subtitle">Stay focused, stay productive</p>
      </header>
      
      <main className="main-content">
        {/* Session Type Tabs */}
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

        {/* Task Input */}
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

        <div className="timer-section">
          <Timer
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

        <div className="session-info">
          <p>Sessions completed: {sessionsCompleted}</p>
          {startTime && (
            <p>Started at: {startTime.toLocaleTimeString()}</p>
          )}
        </div>

        <div className="controls">
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ Settings
          </button>
        </div>

        {showSettings && (
          <Settings
            workTime={workTime}
            breakTime={breakTime}
            longBreakTime={longBreakTime}
            onWorkTimeChange={setWorkTime}
            onBreakTimeChange={setBreakTime}
            onLongBreakTimeChange={setLongBreakTime}
            onClose={() => setShowSettings(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;