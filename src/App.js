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
      const duration = Math.round((endTime - startTime) / 1000 / 60); // duration in minutes
      
      const completedTask = {
        id: Date.now(),
        task: currentTask,
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
          
          {/* Done Button */}
          {currentTask.trim() && startTime && (
            <button 
              className="done-btn"
              onClick={handleMarkDone}
            >
              Done
            </button>
          )}
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

        {/* Task History Section */}
        {completedTasks.length > 0 && (
          <div className="task-history">
            <h3>Completed Tasks</h3>
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
          />
        )}
      </main>
    </div>
  );
}

export default App;