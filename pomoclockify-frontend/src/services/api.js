import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const isDevelopment = process.env.NODE_ENV === 'development';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: false, // Explicitly set for security
});

// Add request interceptor for logging (development only)
api.interceptors.request.use(
  (config) => {
    if (isDevelopment) {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.error('API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (isDevelopment) {
      console.error('API Response Error:', error.response?.status, error.message);
    }
    return Promise.reject(error);
  }
);

// Task API functions
export const taskAPI = {
  // Get all tasks
  getAllTasks: async () => {
    const response = await api.get('/api/tasks');
    return response.data;
  },

  // Get task by ID
  getTaskById: async (id) => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (taskData) => {
    // Convert frontend format to backend format
    const backendTask = {
      taskName: taskData.task,
      sessionType: mapSessionTypeToBackend(taskData.sessionType),
      startTime: taskData.startTime.toISOString(),
      endTime: taskData.endTime.toISOString(),
      duration: taskData.duration
    };
    
    const response = await api.post('/api/tasks', backendTask);
    return mapTaskFromBackend(response.data);
  },

  // Update task
  updateTask: async (id, taskData) => {
    const backendTask = {
      taskName: taskData.task,
      sessionType: mapSessionTypeToBackend(taskData.sessionType),
      startTime: taskData.startTime.toISOString(),
      endTime: taskData.endTime.toISOString(),
      duration: taskData.duration
    };
    
    const response = await api.put(`/api/tasks/${id}`, backendTask);
    return mapTaskFromBackend(response.data);
  },

  // Delete task
  deleteTask: async (id) => {
    await api.delete(`/api/tasks/${id}`);
  },

  // Get today's tasks
  getTodayTasks: async () => {
    const response = await api.get('/api/tasks/today');
    return response.data.map(mapTaskFromBackend);
  },

  // Get today's total duration
  getTodayDuration: async () => {
    const response = await api.get('/api/tasks/today/duration');
    return response.data;
  },

  // Search tasks
  searchTasks: async (query) => {
    const response = await api.get(`/api/tasks/search?query=${encodeURIComponent(query)}`);
    return response.data.map(mapTaskFromBackend);
  }
};

// Settings API functions
export const settingsAPI = {
  // Get current settings
  getSettings: async () => {
    const response = await api.get('/api/settings');
    return response.data;
  },

  // Update settings
  updateSettings: async (settingsData) => {
    const response = await api.put('/api/settings', settingsData);
    return response.data;
  },

  // Reset settings to default
  resetSettings: async () => {
    const response = await api.post('/api/settings/reset');
    return response.data;
  },

  // Increment session count
  incrementSession: async () => {
    const response = await api.post('/api/settings/increment-session');
    return response.data;
  }
};

// Helper functions to map between frontend and backend data formats

// Map frontend session type to backend enum format
const mapSessionTypeToBackend = (sessionType) => {
  const mapping = {
    'work': 'WORK',
    'break': 'BREAK',
    'longBreak': 'LONG_BREAK'
  };
  return mapping[sessionType] || 'WORK';
};

// Map backend session type to frontend format
const mapSessionTypeFromBackend = (sessionType) => {
  const mapping = {
    'WORK': 'work',
    'BREAK': 'break',
    'LONG_BREAK': 'longBreak'
  };
  return mapping[sessionType] || 'work';
};

// Map backend task to frontend format
const mapTaskFromBackend = (backendTask) => {
  return {
    id: backendTask.id,
    task: backendTask.taskName,
    sessionType: mapSessionTypeFromBackend(backendTask.sessionType),
    startTime: new Date(backendTask.startTime),
    endTime: new Date(backendTask.endTime),
    duration: backendTask.duration,
    createdAt: new Date(backendTask.createdAt),
    updatedAt: new Date(backendTask.updatedAt)
  };
};

// Error handling utility
export const handleAPIError = (error, fallbackAction = null) => {
  console.error('API Error:', error);
  
  if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
    console.warn('Network error - server might be offline');
  } else if (error.response?.status === 404) {
    console.warn('Resource not found');
  } else if (error.response?.status >= 500) {
    console.warn('Server error');
  }
  
  // Execute fallback action if provided (e.g., use localStorage)
  if (fallbackAction && typeof fallbackAction === 'function') {
    return fallbackAction();
  }
  
  throw error;
};

// Health check function to test server connectivity
export const checkServerHealth = async () => {
  try {
    await api.get('/api/settings');
    return true;
  } catch (error) {
    console.warn('Server health check failed:', error.message);
    return false;
  }
};

// Retry mechanism for API calls
export const retryAPICall = async (apiCall, maxRetries = 2, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      console.warn(`API call attempt ${i + 1} failed:`, error.message);
      
      if (i === maxRetries - 1) {
        throw error; // Last attempt failed
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Sync local data to server when connection is restored
export const syncLocalDataToServer = async () => {
  try {
    console.log('Attempting to sync local data to server...');
    
    // Get local data
    const localTasks = localStorage.getItem('pomoclockfy-tasks');
    const localSettings = localStorage.getItem('pomoclockfy-settings');
    
    if (localSettings) {
      const settings = JSON.parse(localSettings);
      await settingsAPI.updateSettings(settings);
      console.log('Settings synced to server');
    }
    
    // Note: Task sync would require more complex logic to avoid duplicates
    // For now, we'll just warn about potential inconsistencies
    if (localTasks) {
      const tasks = JSON.parse(localTasks);
      console.warn(`${tasks.length} local tasks found. Manual sync may be required.`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to sync local data to server:', error.message);
    return false;
  }
};

export default api;