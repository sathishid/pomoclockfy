import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AnalyticsView.css';

const AnalyticsView = ({ tasks = [] }) => {
  const [timeframe, setTimeframe] = useState('week'); // week, month, all

  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), [now]);

  // Filter tasks by timeframe
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.startTime) return false;
      const taskDate = new Date(task.startTime);
      const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());

      if (timeframe === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Sunday
        return taskDateOnly >= weekStart && taskDateOnly <= today;
      } else if (timeframe === 'month') {
        return (
          taskDate.getFullYear() === now.getFullYear() &&
          taskDate.getMonth() === now.getMonth()
        );
      }
      return true; // all
    });
  }, [tasks, timeframe, today, now]);

  // Aggregate by date (for bar chart)
  const dailyData = useMemo(() => {
    const map = {};
    filteredTasks.forEach((task) => {
      if (!task.startTime) return;
      const taskDate = new Date(task.startTime);
      const dateStr = taskDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!map[dateStr]) map[dateStr] = 0;
      map[dateStr] += task.duration || 0;
    });

    // Fill gaps with 0 for missing days
    const result = [];
    let current = new Date(today);
    current.setDate(current.getDate() - (timeframe === 'week' ? 6 : 30));

    while (current <= today) {
      const dateStr = current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      result.push({ date: dateStr, minutes: map[dateStr] || 0 });
      current.setDate(current.getDate() + 1);
    }

    // Only show last N days
    const maxDays = timeframe === 'week' ? 7 : 30;
    return result.slice(-maxDays);
  }, [filteredTasks, timeframe]);

  // Aggregate by project (for pie chart)
  const projectData = useMemo(() => {
    const map = {};
    filteredTasks.forEach((task) => {
      const projectName = task.project || 'Unassigned';
      if (!map[projectName]) map[projectName] = 0;
      map[projectName] += task.duration || 0;
    });

    return Object.entries(map).map(([name, minutes]) => ({
      name,
      value: minutes,
    }));
  }, [filteredTasks]);

  // Top 5 tasks
  const topTasks = useMemo(() => {
    return filteredTasks
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5);
  }, [filteredTasks]);

  const totalMinutes = filteredTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const avgDailyMinutes = dailyData.length > 0 ? Math.round(totalMinutes / dailyData.length) : 0;

  // Colors for projects
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffa489'];

  return (
    <div className="analytics-view">
      <div className="analytics-header">
        <h2>Analytics</h2>
        <div className="timeframe-tabs">
          <button
            className={`tab ${timeframe === 'week' ? 'active' : ''}`}
            onClick={() => setTimeframe('week')}
          >
            Week
          </button>
          <button
            className={`tab ${timeframe === 'month' ? 'active' : ''}`}
            onClick={() => setTimeframe('month')}
          >
            Month
          </button>
          <button
            className={`tab ${timeframe === 'all' ? 'active' : ''}`}
            onClick={() => setTimeframe('all')}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-label">Total Time</div>
          <div className="summary-value">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Daily Avg</div>
          <div className="summary-value">{Math.floor(avgDailyMinutes / 60)}h {avgDailyMinutes % 60}m</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Sessions</div>
          <div className="summary-value">{filteredTasks.length}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Projects</div>
          <div className="summary-value">{projectData.length}</div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-container">
          <h3>Daily Time Spent</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value) => `${Math.floor(value / 60)}h ${value % 60}m`} />
              <Bar dataKey="minutes" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {projectData.length > 0 && (
          <div className="chart-container">
            <h3>Time by Project</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${Math.floor(value / 60)}h`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Math.floor(value / 60)}h ${value % 60}m`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {topTasks.length > 0 && (
        <div className="top-tasks">
          <h3>Top Tasks</h3>
          <ul className="top-tasks-list">
            {topTasks.map((task, idx) => (
              <li key={idx} className="top-task-item">
                <div className="top-task-rank">{idx + 1}</div>
                <div className="top-task-info">
                  <div className="top-task-name">{task.task}</div>
                  <div className="top-task-project">{task.project || 'Unassigned'}</div>
                </div>
                <div className="top-task-time">
                  {Math.floor(task.duration / 60)}h {task.duration % 60}m
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
