# Pomoclockfy Frontend

A modern, beautiful Pomodoro timer application combined with time tracking features (inspired by Clockify), built with React.js. This project helps you stay focused, track your work sessions, and maintain productivity.

## 📋 Project Overview

Pomoclockfy is a **browser-based application** that combines the Pomodoro Technique with time tracking capabilities. Currently, all data is stored locally in the browser using **session storage**, with no backend dependency required.

## ✨ Features

- ⏱️ **Customizable Pomodoro Timer**: Set your own work, short break, and long break durations
- 🎯 **Task Tracking**: Create, track, and manage completed work sessions
- 📊 **Session Analytics**: View completed tasks grouped by date with time spent statistics
- 🔊 **Audio Notifications**: Alarm sound when timer completes (with fallback audio synthesis)
- 💾 **Local Data Storage**: All data persists in browser session storage
- 📥 **Data Export**: Export your work history as JSON
- 🗑️ **Data Management**: Clear all data with a single click
- 🎨 **Beautiful UI**: Modern gradient design with smooth animations
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- ⚙️ **Easy Settings**: Customize timer durations and manage data from settings panel
- 🔄 **Auto-cycling**: Automatically switches between work sessions and breaks (short and long)

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Create React App (react-scripts)
- **HTTP Client**: Axios (prepared for future backend integration)
- **Styling**: CSS3 with animations
- **Storage**: Browser Session Storage

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd pomoclockfy/pomoclockify-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 💡 Usage

### Starting a Work Session
1. Click the **Play button** to start your Pomodoro timer
2. Enter a task name (optional) to track what you're working on
3. Focus on your work until the timer completes

### Managing the Timer
- **Pause/Resume**: Click the pause icon to pause, click play to resume
- **Reset**: Click the reset button to reset the current session
- **Session Auto-switch**: The app automatically switches between work and break sessions

### Customizing Settings
1. Click the **Settings button** (gear icon)
2. Adjust timer durations:
   - Work Session duration
   - Short Break duration
   - Long Break duration
3. Click **Save** to apply changes

### Tracking Your Progress
- **View History**: See all completed tasks grouped by date in the history section
- **Statistics**: View total completed tasks and time spent today
- **Export Data**: Click "Export Data" to download your work history as JSON
- **Clear Data**: Use "Clear All Data" to reset your session storage

## ⏱️ Default Timer Settings

- **Work Session**: 25 minutes
- **Short Break**: 5 minutes
- **Long Break**: 15 minutes (after every 4 work sessions)

## 📦 Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode (port 3000)
- `npm test` - Launches the test runner
- `npm run build` - Creates an optimized production build
- `npm run eject` - Ejects from Create React App (⚠️ one-way operation)

## 📁 Project Structure

```
pomoclockify-frontend/
├── src/
│   ├── components/
│   │   ├── Timer.js          # Main timer component with audio support
│   │   ├── Timer.css
│   │   ├── Settings.js       # Settings modal and data management
│   │   └── Settings.css
│   ├── services/
│   │   └── api.js            # API utilities (prepared for backend)
│   ├── App.js                # Main application component
│   ├── App.css
│   └── index.js
├── public/
│   ├── index.html
│   └── alarm.wav             # Timer completion sound
├── package.json
└── README.md
```

## 🔄 Data Persistence

All application data is currently stored in **browser session storage**:
- Timer settings (work, break, long break durations)
- Completed tasks list
- Session statistics

### Future Backend Integration
The project is structured to support backend integration in the future. The `api.js` file includes:
- Axios configuration for API requests
- API endpoints for tasks and settings management
- Server health check functionality
- Sync mechanisms (not currently active)

When backend development begins, no major refactoring will be required.

## 🎵 Audio Implementation

- **Primary Audio**: Uses `alarm.wav` file for timer completion
- **Fallback Audio**: Web Audio API generates a beep if file playback fails
- **Audio Initialization**: Lazily loads on first user interaction (browser security requirement)

## 🚫 Current Limitations

- No backend server required or available
- Data is stored locally in browser session storage only
- Data is cleared when the browser session ends
- No cloud synchronization

## 📝 Notes for Developers

- The project includes backend API preparation code, but it's not active
- CORS configuration exists in backend (`pomoclockfy-backend/`) but isn't needed for current browser-only operation
- To switch to backend later, set `REACT_APP_API_URL` environment variable

## 🚀 Future: AWS Backend Development

We have plans to deploy this app to AWS for learning purposes and to enable cross-device synchronization. The backend will use:
- **AWS Lambda** for serverless compute
- **DynamoDB** for data storage
- **JWT authentication** for secure user management

For detailed implementation plan, architecture, and API specifications, see: [FUTURE_AWS_BACKEND.md](../FUTURE_AWS_BACKEND.md)

**Estimated Cost**: ₹200-500/month  
**Status**: Planning Phase

## 🔧 Troubleshooting

**Audio not playing?**
- Check browser console for errors
- Ensure `public/alarm.wav` exists
- The app will automatically use fallback audio synthesis if file fails

**Data not persisting?**
- Verify browser session storage is enabled
- Check browser console for storage quota errors
- Data persists within the same session; opening in a new tab/window won't share data

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the **Pomodoro Technique** developed by Francesco Cirillo
- Influenced by **Clockify** time tracking features
- Built with modern React best practices
