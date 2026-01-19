import React, { useState, useRef, useEffect } from 'react';
import './TimeSheetView.css';

const TimeSheetView = ({ 
  tasks, 
  onLoadMore, 
  hasMore, 
  isLoading,
  onEditTask,
  onDeleteTask,
  projects 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const observerTarget = useRef(null);

  // Group tasks by date
  const groupTasksByDate = (taskList) => {
    const grouped = taskList.reduce((acc, task) => {
      const dateKey = task.endTime.toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map((dateKey) => ({
        dateKey,
        label: formatDateLabel(new Date(dateKey)),
        tasks: grouped[dateKey].slice().sort((a, b) => b.endTime - a.endTime),
        totalDuration: grouped[dateKey].reduce((sum, task) => sum + task.duration, 0)
      }));
  };

  const formatDateLabel = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSessionTypeLabel = (type) => {
    switch (type) {
      case 'work': return 'Work';
      case 'break': return 'Break';
      case 'longBreak': return 'Long Break';
      default: return type;
    }
  };

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'work': return '#4CAF50';
      case 'break': return '#2196F3';
      case 'longBreak': return '#FF9800';
      default: return '#999';
    }
  };

  const getProjectColor = (projectName, allProjects) => {
    const project = allProjects?.find(p => p.name === projectName);
    return project?.color || '#999';
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const currentTarget = observerTarget.current;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  const handleEditStart = (task) => {
    setEditingId(task.id);
    setEditValues({
      task: task.task,
      startTime: task.startTime.toISOString().slice(0, 16),
      endTime: task.endTime.toISOString().slice(0, 16)
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleEditSave = (taskId) => {
    const startTime = new Date(editValues.startTime);
    const endTime = new Date(editValues.endTime);
    const duration = Math.round((endTime - startTime) / 1000 / 60);

    onEditTask(taskId, {
      task: editValues.task,
      startTime,
      endTime,
      duration
    });

    setEditingId(null);
    setEditValues({});
  };

  const groupedTasks = groupTasksByDate(tasks);

  return (
    <div className="timesheet-view">
      <div className="timesheet-header">
        <div className="timesheet-col time-col">Start</div>
        <div className="timesheet-col time-col">End</div>
        <div className="timesheet-col duration-col">Duration</div>
        <div className="timesheet-col task-col">Task</div>
        <div className="timesheet-col type-col">Type</div>
        <div className="timesheet-col actions-col">Actions</div>
      </div>

      {groupedTasks.length === 0 && !isLoading && (
        <div className="timesheet-empty">
          <p>No completed tasks yet. Start a timer to track your work!</p>
        </div>
      )}

      {groupedTasks.map((group) => (
        <div key={group.dateKey} className="timesheet-date-group">
          <div className="timesheet-date-header">
            <span className="date-label">{group.label}</span>
            <span className="date-total">Total: {formatDuration(group.totalDuration)}</span>
          </div>
          
          {group.tasks.map((task) => (
            <div key={task.id} className="timesheet-row">
              {editingId === task.id ? (
                // Editing mode
                <>
                  <div className="timesheet-col time-col">
                    <input
                      type="datetime-local"
                      value={editValues.startTime}
                      onChange={(e) => setEditValues({ ...editValues, startTime: e.target.value })}
                      className="edit-input time-input"
                    />
                  </div>
                  <div className="timesheet-col time-col">
                    <input
                      type="datetime-local"
                      value={editValues.endTime}
                      onChange={(e) => setEditValues({ ...editValues, endTime: e.target.value })}
                      className="edit-input time-input"
                    />
                  </div>
                  <div className="timesheet-col duration-col">
                    {formatDuration(Math.round((new Date(editValues.endTime) - new Date(editValues.startTime)) / 1000 / 60))}
                  </div>
                  <div className="timesheet-col task-col">
                    <input
                      type="text"
                      value={editValues.task}
                      onChange={(e) => setEditValues({ ...editValues, task: e.target.value })}
                      className="edit-input task-input"
                      placeholder="Task name"
                    />
                  </div>
                  <div className="timesheet-col type-col">
                    <span 
                      className="session-badge"
                      style={{ backgroundColor: getSessionTypeColor(task.sessionType) }}
                    >
                      {getSessionTypeLabel(task.sessionType)}
                    </span>
                  </div>
                  <div className="timesheet-col actions-col">
                    <button 
                      className="action-btn save-btn"
                      onClick={() => handleEditSave(task.id)}
                      title="Save changes"
                    >
                      ✓
                    </button>
                    <button 
                      className="action-btn cancel-btn"
                      onClick={handleEditCancel}
                      title="Cancel editing"
                    >
                      ✕
                    </button>
                  </div>
                </>
              ) : (
                // View mode
                <>
                  <div className="timesheet-col time-col">{formatTime(task.startTime)}</div>
                  <div className="timesheet-col time-col">{formatTime(task.endTime)}</div>
                  <div className="timesheet-col duration-col">{formatDuration(task.duration)}</div>
                  <div className="timesheet-col task-col">
                    <div className="task-content">
                      {task.project && (
                        <span 
                          className="project-dot"
                          style={{ backgroundColor: getProjectColor(task.project, projects) }}
                          title={task.project}
                        />
                      )}
                      <span className="task-name">{task.task || '(No description)'}</span>
                      {task.tags && task.tags.length > 0 && (
                        <div className="task-tags">
                          {task.tags.map((tag, idx) => (
                            <span key={idx} className="task-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="timesheet-col type-col">
                    <span 
                      className="session-badge"
                      style={{ backgroundColor: getSessionTypeColor(task.sessionType) }}
                    >
                      {getSessionTypeLabel(task.sessionType)}
                    </span>
                  </div>
                  <div className="timesheet-col actions-col">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEditStart(task)}
                      title="Edit task"
                    >
                      ✎
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => onDeleteTask(task.id)}
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={observerTarget} className="load-more-trigger">
          {isLoading && <div className="loading-spinner">Loading more tasks...</div>}
        </div>
      )}

      {!hasMore && tasks.length > 0 && (
        <div className="end-of-list">
          <p>— End of history —</p>
        </div>
      )}
    </div>
  );
};

export default TimeSheetView;
