import React, { useState, useRef, useEffect } from 'react';
import './ProjectSelector.css';

/**
 * Project Selector Component
 * 
 * Features:
 * - Dropdown with color-coded projects
 * - Create new project inline
 * - Stores color with each project
 * - Shows selected project color
 * 
 * Props:
 * - value: selected project string or null
 * - onChange: (project: string | null) => void
 * - projects: array of {name: string, color: string}
 * - onCreateProject: (name: string, color: string) => void
 * - placeholder: string (optional)
 */
const ProjectSelector = ({ 
  value = null, 
  onChange,
  projects = [],
  onCreateProject,
  placeholder = 'Select project...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#4CAF50');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const dropdownRef = useRef(null);

  const colors = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#F44336', // Red
    '#00BCD4', // Cyan
    '#FFEB3B', // Yellow
    '#795548'  // Brown
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProject = projects.find(p => p.name === value);
  const selectedColor = selectedProject?.color || '#999';

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim(), newProjectColor);
      setNewProjectName('');
      setNewProjectColor('#4CAF50');
      setShowCreateForm(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="project-selector-container" ref={dropdownRef}>
      <button
        type="button"
        className="project-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          borderColor: selectedColor,
          backgroundColor: selectedColor ? `${selectedColor}15` : 'transparent'
        }}
      >
        <span 
          className="project-color-dot"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="project-name">
          {value || placeholder}
        </span>
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="project-dropdown">
          <div className="project-list">
            <div
              className={`project-item ${!value ? 'selected' : ''}`}
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
            >
              <span className="project-item-dot" style={{ backgroundColor: '#999' }} />
              <span>None</span>
            </div>

            {Array.isArray(projects) && projects.map(project => (
              <div
                key={project.name}
                className={`project-item ${value === project.name ? 'selected' : ''}`}
                onClick={() => {
                  onChange(project.name);
                  setIsOpen(false);
                }}
              >
                <span 
                  className="project-item-dot"
                  style={{ backgroundColor: project.color }}
                />
                <span>{String(project.name)}</span>
              </div>
            ))}
          </div>

          {!showCreateForm && (
            <button
              type="button"
              className="create-project-btn"
              onClick={() => setShowCreateForm(true)}
            >
              + New Project
            </button>
          )}

          {showCreateForm && (
            <div className="create-project-form">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className="project-name-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') setShowCreateForm(false);
                }}
              />
              
              <div className="color-picker">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${newProjectColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewProjectColor(color)}
                    title={`Color ${color}`}
                  />
                ))}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="create-btn"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                >
                  Create
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
