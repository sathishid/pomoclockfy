import { useState, useEffect, useRef, useCallback } from 'react';
import './Timer.css';

const Timer = ({ initialTime, isRunning, onToggle, onReset, onComplete, sessionType, currentTask, startTime, onTimeUpdate }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime * 60);
  const intervalRef = useRef(null);
  const endTimeRef = useRef(null); // Target timestamp when the timer should end
  const audioRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/alarm.wav');
    audioRef.current.volume = 0.5;
    audioRef.current.preload = 'auto'; // Add preloading
    
    // Test audio on first user interaction
    const enableAudio = () => {
      if (audioRef.current && !audioEnabled) {
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setAudioEnabled(true);
        }).catch(error => {
          console.log('Audio initialization failed:', error);
        });
      }
    };
    
    // Add click listener to enable audio
    document.addEventListener('click', enableAudio, { once: true });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener('click', enableAudio);
    };
  }, [audioEnabled]);

  const playFallbackAlarm = useCallback(() => {
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
  }, []);

  const playAlarmSound = useCallback(() => {
    if (audioRef.current && audioEnabled) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log('Audio play failed:', error);
        playFallbackAlarm();
      });
    } else {
      console.log('Audio not enabled or not loaded, using fallback');
      playFallbackAlarm();
    }
  }, [audioEnabled, playFallbackAlarm]);

  useEffect(() => {
    setTimeLeft(initialTime * 60);
    endTimeRef.current = null;
    // Notify parent of time change
    if (onTimeUpdate) {
      onTimeUpdate(initialTime * 60);
    }
  }, [initialTime, onTimeUpdate]);

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      endTimeRef.current = null;
      return undefined;
    }

    // Set the expected end timestamp when starting or resuming
    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }

    const tick = () => {
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
      setTimeLeft(remainingSeconds);
      
      // Notify parent of time change
      if (onTimeUpdate) {
        onTimeUpdate(remainingSeconds);
      }

      if (remainingSeconds <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        endTimeRef.current = null;
        playAlarmSound();
        onComplete();
      }
    };

    // Tick immediately so background-tab throttling cannot hide completion
    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning, playAlarmSound, onComplete, onTimeUpdate, timeLeft]);

  // Timer component now runs headless (no UI) - TimerBar displays the countdown
  // This component only handles: timer logic, audio playback, and completion callbacks
  return null;
};

export default Timer;