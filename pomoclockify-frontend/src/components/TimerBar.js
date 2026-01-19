import React from 'react';
import './TimerBar.css';
import ProjectSelector from './ProjectSelector';
import TagInput from './TagInput';

/**
 * Horizontal Timer Bar (Clockify-style)
 * 
 * Features:
 * - Task input field (editable while running)
 * - Play/pause button
 * - Time display (MM:SS)
 * - Session progress dots (●●●○)
 * - Settings icon
 * - Project selector with color coding
 * - Tag input with autocomplete
 * 
 * Props:
 * - timeLeft: seconds remaining
 * - isRunning: boolean
 * - currentSession: 'work' | 'break' | 'longBreak'
 * - currentTask: string
 * - sessionsCompleted: number
 * - currentProject: string
 * - currentTags: array
 * - projects: array
 * - allTags: array
 * - onToggle: () => void
 * - onTaskChange: (task: string) => void
 * - onSettings: () => void
 * - onProjectChange: (project: string) => void
 * - onTagsChange: (tags: array) => void
 * - onCreateProject: (project: object) => void
 * - onDone: () => void
 */
const TimerBar = ({
  timeLeft,
  isRunning,
  currentSession,
  currentTask,
  sessionsCompleted,
  currentProject,
  currentTags,
  projects,
  allTags,
  onToggle,
  onTaskChange,
  onSettings,
  onProjectChange,
  onTagsChange,
  onCreateProject,
  onDone
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render session progress dots (●●●○)
  const renderSessionDots = () => {
    const dots = [];
    const sessionNumber = (sessionsCompleted % 4) + 1;
    
    for (let i = 1; i <= 4; i++) {
      dots.push(
        <span key={i} className={`session-dot ${i <= sessionNumber ? 'filled' : 'empty'}`}>
          ●
        </span>
      );
    }
    
    return dots;
  };

  return (
    <div className={`timer-bar ${currentSession} ${isRunning ? 'running' : ''}`}>
      <div className="timer-bar-container">
        {/* Play/Pause Button */}
        <button 
          className={`timer-bar-play-btn ${isRunning ? 'pause' : 'play'}`}
          onClick={onToggle}
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? '⏸' : '▶'}
        </button>

        {/* Task Input */}
        <input
          type="text"
          className="timer-bar-task-input"
          placeholder="What are you working on?"
          value={currentTask}
          onChange={(e) => onTaskChange(e.target.value)}
          disabled={false} // Allow editing while running (Clockify-style)
        />

        {/* Project Selector */}
        <div className="timer-bar-project">
          <ProjectSelector
            value={currentProject}
            onChange={onProjectChange}
            projects={projects}
            onCreateProject={onCreateProject}
          />
        </div>

        {/* Tag Input */}
        <div className="timer-bar-tags">
          <TagInput
            value={currentTags}
            onChange={onTagsChange}
            existingTags={allTags}
          />
        </div>

        {/* Time Display */}
        <div className="timer-bar-time">
          {formatTime(timeLeft)}
        </div>

        {/* Done Button - Save current task */}
        {(isRunning || currentTask) && (
          <button 
            className="timer-bar-done-btn"
            onClick={onDone}
            title="Save task"
          >
            Done
          </button>
        )}

        {/* Session Progress Dots */}
        <div className="timer-bar-dots">
          {renderSessionDots()}
        </div>

        {/* Settings Button */}
        <button 
          className="timer-bar-settings-btn"
          onClick={onSettings}
          title="Settings"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default TimerBar;
