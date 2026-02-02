import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Timer from './components/Timer';
import TimerBar from './components/TimerBar';
import TimeSheetView from './components/TimeSheetView';
import Settings from './components/Settings';
import AnalyticsView from './components/AnalyticsView';
import { taskAPI, settingsAPI, checkServerHealth, syncLocalDataToServer } from './services/api';

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
  const [serverAvailable, setServerAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0); // Track current timer countdown in seconds
  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const TASKS_PER_LOAD = 50;
  const [currentProject, setCurrentProject] = useState(null);
  const [currentTags, setCurrentTags] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [viewMode, setViewMode] = useState('history'); // 'history' or 'analytics'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);
  const [nextSessionType, setNextSessionType] = useState(null);
  const [lastCompletedTaskDetails, setLastCompletedTaskDetails] = useState(null);

  // Initialize displayed tasks when completedTasks changes
  useEffect(() => {
    if (completedTasks.length > 0) {
      const initialTasks = completedTasks.slice(0, TASKS_PER_LOAD);
      setDisplayedTasks(initialTasks);
      setHasMoreTasks(completedTasks.length > TASKS_PER_LOAD);
    } else {
      setDisplayedTasks([]);
      setHasMoreTasks(false);
    }
  }, [completedTasks, TASKS_PER_LOAD]);

  // Load more tasks for infinite scroll
  const handleLoadMore = () => {
    if (loadingMore || !hasMoreTasks) return;
    
    setLoadingMore(true);
    
    // Simulate slight delay for better UX
    setTimeout(() => {
      const currentLength = displayedTasks.length;
      const moreTasks = completedTasks.slice(currentLength, currentLength + TASKS_PER_LOAD);
      
      setDisplayedTasks(prev => [...prev, ...moreTasks]);
      setHasMoreTasks(currentLength + moreTasks.length < completedTasks.length);
      setLoadingMore(false);
    }, 300);
  };

  // Load data from server or localStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Check if server is available
      const serverStatus = await checkServerHealth();
      setServerAvailable(serverStatus);
      
      if (serverStatus) {
        try {
          // Load from server
          console.log('Loading data from server...');
          const [tasks, settings] = await Promise.all([
            taskAPI.getAllTasks(),
            settingsAPI.getSettings()
          ]);
          
          setCompletedTasks(tasks);
          setWorkTime(settings.workTime);
          setBreakTime(settings.breakTime);
          setLongBreakTime(settings.longBreakTime);
          setSessionsCompleted(settings.sessionsCompleted);
          
          // Also save to localStorage as backup
          localStorage.setItem('pomoclockfy-tasks', JSON.stringify(tasks));
          localStorage.setItem('pomoclockfy-settings', JSON.stringify(settings));
          
        } catch (error) {
          console.warn('Failed to load from server, falling back to localStorage');
          loadFromLocalStorage();
        }
      } else {
        console.warn('Server unavailable, loading from localStorage');
        loadFromLocalStorage();
      }
      
      setIsLoading(false);
    };

    const loadFromLocalStorage = () => {
      const savedTasks = localStorage.getItem('pomoclockfy-tasks');
      const savedSettings = localStorage.getItem('pomoclockfy-settings');
      const savedProjects = localStorage.getItem('pomoclockfy-projects');
      
      if (savedTasks) {
        try {
          const tasks = JSON.parse(savedTasks);
          // Convert date strings back to Date objects
          const tasksWithDates = tasks.map(task => ({
            ...task,
            startTime: new Date(task.startTime),
            endTime: new Date(task.endTime),
            tags: Array.isArray(task.tags) ? task.tags.map((tag) => String(tag)) : []
          }));
          setCompletedTasks(tasksWithDates);
          
          // Extract all unique tags from tasks
          const tagsSet = new Set();
          tasksWithDates.forEach(task => {
            if (task.tags && Array.isArray(task.tags)) {
              task.tags.forEach(tag => tagsSet.add(String(tag)));
            }
          });
          setAllTags(Array.from(tagsSet).sort());
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
      
      if (savedProjects) {
        try {
          const parsedProjects = JSON.parse(savedProjects);
          setProjects(parsedProjects);
        } catch (error) {
          console.error('Error loading projects from localStorage:', error);
        }
      }
    };

    loadData();
  }, []);

  // Periodic server connection check (every 30 seconds when offline)
  useEffect(() => {
    if (!serverAvailable) {
      const interval = setInterval(async () => {
        console.log('Checking server connection...');
        const isOnline = await checkServerHealth();
        if (isOnline) {
          setServerAvailable(true);
          
          // Try to sync local data to server
          try {
            await syncLocalDataToServer();
            console.log('Successfully reconnected and synced data');
          } catch (error) {
            console.warn('Reconnected but failed to sync data:', error.message);
          }
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [serverAvailable]);

  // Save data to server and localStorage whenever they change
  useEffect(() => {
    if (completedTasks.length > 0 && !isLoading) {
      // Always save to localStorage as backup
      localStorage.setItem('pomoclockfy-tasks', JSON.stringify(completedTasks));
    }
  }, [completedTasks, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      const settings = {
        workTime,
        breakTime,
        longBreakTime,
        sessionsCompleted
      };
      
      // Always save to localStorage as backup
      localStorage.setItem('pomoclockfy-settings', JSON.stringify(settings));
      
      // Try to save to server if available
      if (serverAvailable) {
        settingsAPI.updateSettings(settings).catch(error => {
          console.warn('Failed to sync settings to server:', error.message);
        });
      }
    }
  }, [workTime, breakTime, longBreakTime, sessionsCompleted, serverAvailable, isLoading]);

  const getCurrentSessionTime = useCallback(() => {
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
  }, [currentSession, workTime, breakTime, longBreakTime]);

  // Validate that new task doesn't overlap with existing tasks
  const validateTaskOverlap = (newTask) => {
    if (!newTask.startTime || !newTask.endTime) {
      return { valid: true, message: '' };
    }

    const newStart = new Date(newTask.startTime).getTime();
    const newEnd = new Date(newTask.endTime).getTime();

    for (const existingTask of completedTasks) {
      const existingStart = new Date(existingTask.startTime).getTime();
      const existingEnd = new Date(existingTask.endTime).getTime();

      // Check if new task overlaps with existing task
      // Overlap occurs if: new task starts before existing task ends AND new task ends after existing task starts
      if (newStart < existingEnd && newEnd > existingStart) {
        return {
          valid: false,
          message: `This task overlaps with existing task "${existingTask.task}" (${new Date(existingTask.startTime).toLocaleTimeString()} - ${new Date(existingTask.endTime).toLocaleTimeString()})`
        };
      }
    }

    return { valid: true, message: '' };
  };

  // Callback to update timeLeft from Timer component
  const handleTimeUpdate = useCallback((seconds) => {
    setTimeLeft(seconds);
  }, []);

  const handleFullscreen = () => {
    const appElement = document.querySelector('.App');
    if (!isFullscreen) {
      // Enter fullscreen
      if (appElement.requestFullscreen) {
        appElement.requestFullscreen();
      } else if (appElement.webkitRequestFullscreen) {
        appElement.webkitRequestFullscreen();
      } else if (appElement.mozRequestFullScreen) {
        appElement.mozRequestFullScreen();
      } else if (appElement.msRequestFullscreen) {
        appElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Initialize timeLeft when session changes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getCurrentSessionTime() * 60);
    }
  }, [currentSession, workTime, breakTime, longBreakTime, isRunning, getCurrentSessionTime]);

  const handleSessionComplete = async () => {
    // Create and save the completed task
    if (currentTask.trim() && startTime) {
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / (1000 * 60)); // duration in minutes
      const safeTags = Array.isArray(currentTags)
        ? currentTags.map((tag) => String(tag))
        : [];
      
      const completedTask = {
        id: Date.now(), // Temporary ID for optimistic update
        task: currentTask.trim(),
        sessionType: currentSession,
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        project: currentProject,
        tags: safeTags
      };
      
      // Store task details for potential "Continue Working" action
      setLastCompletedTaskDetails({
        task: completedTask.task,
        project: completedTask.project,
        tags: completedTask.tags
      });
      
      // Validate for overlaps
      const validation = validateTaskOverlap(completedTask);
      if (!validation.valid) {
        alert(`Cannot save task: ${validation.message}`);
        return;
      }
      
      // Optimistic update
      setCompletedTasks(prev => [completedTask, ...prev]);
      
      // Try to save to server
      if (serverAvailable) {
        try {
          const savedTask = await taskAPI.createTask(completedTask);
          // Update with server-generated ID and data
          setCompletedTasks(prev => 
            prev.map(task => 
              task.id === completedTask.id ? savedTask : task
            )
          );
        } catch (error) {
          console.warn('Failed to save task to server:', error.message);
          // Task already added optimistically, just warn user
        }
      }
    }
    
    // Handle session transitions
    if (currentSession === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      // Try to increment session count on server
      if (serverAvailable) {
        try {
          await settingsAPI.incrementSession();
        } catch (error) {
          console.warn('Failed to sync session increment to server:', error.message);
        }
      }
      
      // Determine next session type
      let nextSession;
      if (newSessionsCompleted % 4 === 0) {
        nextSession = 'longBreak';
      } else {
        nextSession = 'break';
      }
      
      // Show break prompt instead of auto-transitioning
      setNextSessionType(nextSession);
      setShowBreakPrompt(true);
    } else {
      // Transitioning from break back to work
      setCurrentSession('work');
    }
    setIsRunning(false);
    
    // Reset task, tags, and startTime after saving
    setCurrentTask('');
    setCurrentTags([]);
    setStartTime(null);
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

  const handleDone = async () => {
    if (!currentTask.trim()) {
      alert('Please enter a task name before saving.');
      return;
    }
    if (!startTime) {
      alert('Please start the timer before saving.');
      return;
    }

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / (1000 * 60)); // duration in minutes
    const safeTags = Array.isArray(currentTags)
      ? currentTags.map((tag) => String(tag))
      : [];
    
    const completedTask = {
      id: Date.now(),
      task: currentTask.trim(),
      sessionType: currentSession,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      project: currentProject,
      tags: safeTags
    };
    
    // Validate for overlaps
    const validation = validateTaskOverlap(completedTask);
    if (!validation.valid) {
      alert(`Cannot save task: ${validation.message}`);
      return;
    }
    
    // Optimistic update
    setCompletedTasks(prev => [completedTask, ...prev]);
    
    // Try to save to server
    if (serverAvailable) {
      try {
        const savedTask = await taskAPI.createTask(completedTask);
        setCompletedTasks(prev => 
          prev.map(task => 
            task.id === completedTask.id ? savedTask : task
          )
        );
      } catch (error) {
        console.warn('Failed to save task to server:', error.message);
      }
    }

    // Reset for next task
    setCurrentTask('');
    setCurrentProject(null);
    setCurrentTags([]);
    setIsRunning(false);
    setStartTime(null);
    setTimerKey(prev => prev + 1);
  };

  const handleCreateProject = (projectName, color) => {
    const newProject = { name: projectName, color };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('pomoclockfy-projects', JSON.stringify(updatedProjects));
  };

  const handleTagsChange = (tags) => {
    const safeTags = Array.isArray(tags) ? tags.map((tag) => String(tag)) : [];
    setCurrentTags(safeTags);
    // Update all tags set
    const allTagsSet = new Set(allTags);
    safeTags.forEach(tag => allTagsSet.add(tag));
    setAllTags(Array.from(allTagsSet).sort());
  };

  // Deprecated: Session type change moved to TimerBar integration
  // const handleSessionTypeChange = (sessionType) => {
  //   if (!isRunning) {
  //     setCurrentSession(sessionType);
  //   }
  // };

  // Deprecated: Mark done functionality - handled by Timer completion
  /* 
  const handleMarkDone = async () => {
    if (currentTask.trim() && startTime) {
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / (1000 * 60)); // duration in minutes
      
      const completedTask = {
        id: Date.now(), // Temporary ID for optimistic update
        task: currentTask.trim(),
        sessionType: currentSession,
        startTime: startTime,
        endTime: endTime,
        duration: duration
      };
      
      // Optimistic update
      setCompletedTasks(prev => [completedTask, ...prev]);
      
      // Try to save to server
      if (serverAvailable) {
        try {
          const savedTask = await taskAPI.createTask(completedTask);
          // Update with server-generated ID and data
          setCompletedTasks(prev => 
            prev.map(task => 
              task.id === completedTask.id ? savedTask : task
            )
          );
        } catch (error) {
          console.warn('Failed to save task to server:', error.message);
          // Task already added optimistically, just warn user
        }
      }
      
      setCurrentTask('');
      setIsRunning(false);
      setStartTime(null);
      setTimerKey(prev => prev + 1); // Force timer reset
    }
  };
  */

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task from history?')) {
      // Optimistic update
      const taskToDelete = completedTasks.find(task => task.id === taskId);
      setCompletedTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Try to delete from server
      if (serverAvailable && taskToDelete && typeof taskToDelete.id === 'number' && taskToDelete.id > 1000000000000) {
        // Only try to delete if it's a server-generated ID (not timestamp ID)
        try {
          await taskAPI.deleteTask(taskId);
        } catch (error) {
          console.warn('Failed to delete task from server:', error.message);
          // Revert optimistic update
          setCompletedTasks(prev => [taskToDelete, ...prev].sort((a, b) => b.endTime - a.endTime));
        }
      }
    }
  };

  const handleTakeBreak = () => {
    // Accept the break - transition to the next session
    setCurrentSession(nextSessionType);
    setShowBreakPrompt(false);
    setNextSessionType(null);
    setLastCompletedTaskDetails(null);
  };

  const handleSkipBreak = () => {
    // Skip the break - continue working on the same task
    if (lastCompletedTaskDetails) {
      setCurrentTask(lastCompletedTaskDetails.task);
      setCurrentProject(lastCompletedTaskDetails.project || null);
      setCurrentTags(Array.isArray(lastCompletedTaskDetails.tags) ? lastCompletedTaskDetails.tags : []);
    }
    setCurrentSession('work');
    setTimerKey(prev => prev + 1); // Force Timer component to reinitialize
    setTimeLeft(getCurrentSessionTime() * 60);
    setStartTime(new Date());
    setIsRunning(true);
    setShowBreakPrompt(false);
    setNextSessionType(null);
    setLastCompletedTaskDetails(null);
  };

  const handleReuseTask = (taskId) => {
    // Find the task to reuse
    const taskToReuse = completedTasks.find(task => task.id === taskId);
    if (taskToReuse) {
      // Populate task input, project, and tags from the completed task
      setCurrentTask(taskToReuse.task);
      setCurrentProject(taskToReuse.project || null);
      setCurrentTags(Array.isArray(taskToReuse.tags) ? taskToReuse.tags.map(tag => String(tag)) : []);
      
      // Update all tags set
      const allTagsSet = new Set(allTags);
      if (Array.isArray(taskToReuse.tags)) {
        taskToReuse.tags.forEach(tag => allTagsSet.add(String(tag)));
      }
      setAllTags(Array.from(allTagsSet).sort());
    }
  };

  const handleEditTask = async (taskId, updates) => {
    // Optimistic update
    const originalTasks = completedTasks;
    setCompletedTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ).sort((a, b) => b.endTime - a.endTime)
    );
    
    // Try to update on server
    if (serverAvailable) {
      try {
        await taskAPI.updateTask(taskId, updates);
      } catch (error) {
        console.warn('Failed to update task on server:', error.message);
        // Revert on error
        setCompletedTasks(originalTasks);
      }
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

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all task history and reset settings? This cannot be undone.')) {
      // Clear local state
      setCompletedTasks([]);
      setWorkTime(25);
      setBreakTime(5);
      setLongBreakTime(15);
      setSessionsCompleted(0);
      localStorage.removeItem('pomoclockfy-tasks');
      localStorage.removeItem('pomoclockfy-settings');
      
      // Try to reset settings on server
      if (serverAvailable) {
        try {
          await settingsAPI.resetSettings();
          // Note: We don't have a bulk delete API for tasks, 
          // so tasks will remain on server but be cleared locally
          console.warn('Settings reset on server. Tasks cleared locally but may remain on server.');
        } catch (error) {
          console.warn('Failed to reset settings on server:', error.message);
        }
      }
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
        {!isLoading && (
          <div className="server-status">
            <span className={`status-indicator ${serverAvailable ? 'online' : 'offline'}`}>
              {serverAvailable ? '🟢 Server Online' : '🔴 Offline Mode'}
            </span>
          </div>
        )}
        <button 
          className="fullscreen-btn"
          onClick={handleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>
      </header>
      
      <main className="main-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your data...</p>
          </div>
        ) : (
        <>
          {/* TimerBar - Renders at full width (outside app-layout) */}
          <TimerBar
            timeLeft={timeLeft}
            isRunning={isRunning}
            currentSession={currentSession}
            currentTask={currentTask}
            sessionsCompleted={sessionsCompleted}
            currentProject={currentProject}
            currentTags={currentTags}
            projects={projects}
            allTags={allTags}
            onToggle={handleToggleTimer}
            onTaskChange={setCurrentTask}
            onSettings={() => setShowSettings(true)}
            onProjectChange={setCurrentProject}
            onTagsChange={handleTagsChange}
            onCreateProject={handleCreateProject}
            onDone={handleDone}
          />

          {/* Main content constrained to max-width */}
          <div className="app-layout">

          {/* Hidden Timer component for background logic */}
          <div style={{ display: 'none' }}>
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
              onTimeUpdate={handleTimeUpdate}
            />
          </div>
        
        {/* Task History & Analytics Section */}
        {completedTasks.length > 0 && (
          <div className="task-history">
            <div className="history-header">
              <h3>Task History</h3>
              <div className="view-mode-tabs">
                <button
                  className={`view-tab ${viewMode === 'history' ? 'active' : ''}`}
                  onClick={() => setViewMode('history')}
                >
                  History
                </button>
                <button
                  className={`view-tab ${viewMode === 'analytics' ? 'active' : ''}`}
                  onClick={() => setViewMode('analytics')}
                >
                  Analytics
                </button>
              </div>
              {completedTasks.length > 0 && viewMode === 'history' && (
                <div className="history-subtext">
                  {completedTasks.length} total {completedTasks.length === 1 ? 'entry' : 'entries'}
                </div>
              )}
            </div>
            {viewMode === 'history' ? (
              <TimeSheetView 
                tasks={displayedTasks}
                onLoadMore={handleLoadMore}
                hasMore={hasMoreTasks}
                isLoading={loadingMore}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onReuseTask={handleReuseTask}
                projects={projects}
              />
            ) : (
              <AnalyticsView tasks={completedTasks} />
            )}
          </div>
        )}
        </div>
        </>
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

        {/* Break Prompt Dialog */}
        {showBreakPrompt && (
          <div className="modal-overlay">
            <div className="break-prompt-modal">
              <h2>Time for a break! 🎉</h2>
              <p>You've completed a work session. Would you like to take a break or continue working?</p>
              <div className="break-prompt-buttons">
                <button 
                  className="btn-take-break"
                  onClick={handleTakeBreak}
                >
                  {nextSessionType === 'longBreak' ? '☕ Take Long Break' : '💧 Take Break'}
                </button>
                <button 
                  className="btn-skip-break"
                  onClick={handleSkipBreak}
                >
                  💪 Continue Working
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;