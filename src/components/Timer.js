import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';

const Timer = ({ initialTime, isRunning, onToggle, onReset, onComplete, sessionType, currentTask, startTime }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime * 60);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/alarm.wav'); // Use the existing alarm.wav file
    audioRef.current.volume = 0.5; // Set volume (0.0 to 1.0)
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAlarmSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to beginning
      audioRef.current.play().catch(error => {
        console.log('Audio play failed:', error);
        // Fallback to Web Audio API if file fails
        playFallbackAlarm();
      });
    } else {
      playFallbackAlarm();
    }
  };

  const playFallbackAlarm = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.4);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
  };

  useEffect(() => {
    setTimeLeft(initialTime * 60);
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            playAlarmSound(); // Play alarm when timer completes
            onComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = initialTime * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const handleReset = () => {
    setTimeLeft(initialTime * 60);
    onReset();
  };

  return (
    <div className={`timer ${sessionType}`}>
      <div className="timer-circle">
        <svg className="progress-ring" width="300" height="300">
          <circle
            className="progress-ring-background"
            cx="150"
            cy="150"
            r="120"
            fill="transparent"
            stroke="#e6e6e6"
            strokeWidth="8"
          />
          <circle
            className="progress-ring-progress"
            cx="150"
            cy="150"
            r="120"
            fill="transparent"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgress() / 100)}`}
            transform="rotate(-90 150 150)"
          />
        </svg>
        <div className="timer-display">
          <div className="time">{formatTime(timeLeft)}</div>
          {currentTask && (
            <div className="current-task">{currentTask}</div>
          )}
        </div>
      </div>
      
      <div className="timer-controls">
        <button 
          className={`play-pause-btn ${isRunning ? 'pause' : 'play'}`}
          onClick={onToggle}
        >
          {isRunning ? '⏸️' : '▶️'}
        </button>
        <button className="reset-btn" onClick={handleReset}>
          🔄
        </button>
      </div>
    </div>
  );
};

export default Timer;