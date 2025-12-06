import React, { useState, useEffect, useRef } from 'react';
import { TimerMode } from './types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Armchair, 
  CheckCircle2,
  Music,
  Volume2,
  VolumeX
} from 'lucide-react';

const TIMER_DURATIONS = {
  [TimerMode.POMODORO]: 25 * 60,
  [TimerMode.SHORT_BREAK]: 5 * 60,
  [TimerMode.LONG_BREAK]: 15 * 60,
};

// Spotify Playlist: Chill Village
const SPOTIFY_PLAYLIST_URL = "https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator&theme=0";

// --- Sound Utilities (Synthesized to avoid external dependencies) ---
const SoundEngine = {
  playClick: () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Organic Wood Block / Soft Switch Sound
      // Using Sine wave for a smoother, non-electronic sound
      osc.type = 'sine';
      
      const t = ctx.currentTime;
      
      // Pitch: Lower frequency for a "thock" sound rather than a "ping"
      // Starts at 500Hz and drops quickly to 200Hz
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);

      // Volume Envelope: Very fast attack and decay to simulate a solid click
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.005); // Max volume reduced to 0.08 (was 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  },
  
  playAlarm: () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        // Soft bell envelope
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05); // Reduced alarm volume slightly
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Melodic chime: E5 - G#5 - B5 (Major triad)
      const now = ctx.currentTime;
      playNote(659.25, now, 1.5);       // E5
      playNote(830.61, now + 0.2, 1.5); // G#5
      playNote(987.77, now + 0.4, 2.0); // B5
    } catch (e) {
      console.error("Alarm play failed", e);
    }
  }
};

const App: React.FC = () => {
  // Timer State
  const [mode, setMode] = useState<TimerMode>(TimerMode.POMODORO);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[TimerMode.POMODORO]);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Helper to format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer Finished
      setIsActive(false);
      if (soundEnabled) SoundEngine.playAlarm();
      
      if (mode === TimerMode.POMODORO) {
        setCompletedSessions((prev) => prev + 1);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, soundEnabled]);

  const toggleTimer = () => {
    if (soundEnabled) SoundEngine.playClick();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (soundEnabled) SoundEngine.playClick();
    setIsActive(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    if (soundEnabled) SoundEngine.playClick();
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(TIMER_DURATIONS[newMode]);
  };

  const toggleSound = () => {
    // Play a click to confirm enabling sound, or just toggle if disabling
    if (!soundEnabled) SoundEngine.playClick(); 
    setSoundEnabled(!soundEnabled);
  };

  // Dynamic Styles based on mode (Pastel / Pale colors)
  const getGradient = () => {
    switch (mode) {
      case TimerMode.POMODORO: return 'from-rose-100 to-orange-100 border-rose-200';
      case TimerMode.SHORT_BREAK: return 'from-teal-100 to-emerald-100 border-teal-200';
      case TimerMode.LONG_BREAK: return 'from-blue-100 to-indigo-100 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (mode) {
      case TimerMode.POMODORO: return 'text-rose-600';
      case TimerMode.SHORT_BREAK: return 'text-teal-600';
      case TimerMode.LONG_BREAK: return 'text-indigo-600';
    }
  };

  const getButtonActiveStyle = (targetMode: TimerMode) => {
    if (mode !== targetMode) return 'text-stone-500 hover:text-stone-800 bg-transparent';
    switch (targetMode) {
      case TimerMode.POMODORO: return 'bg-rose-500 text-white shadow-lg shadow-rose-200';
      case TimerMode.SHORT_BREAK: return 'bg-teal-500 text-white shadow-lg shadow-teal-200';
      case TimerMode.LONG_BREAK: return 'bg-indigo-500 text-white shadow-lg shadow-indigo-200';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 font-sans selection:bg-rose-200 flex items-center justify-center p-4 sm:p-8">
      
      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Timer & Controls */}
        <div className="flex flex-col justify-center space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-2 text-stone-900">
                Tomate Tiempo
              </h1>
              <p className="text-stone-500 text-sm">Organiza tu día. Encuentra tu ritmo.</p>
            </div>
            
            <button 
              onClick={toggleSound}
              className="p-3 rounded-full hover:bg-stone-200/50 text-stone-500 transition-colors"
              title={soundEnabled ? "Desactivar sonidos" : "Activar sonidos"}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>

          {/* Timer Card */}
          <div className={`relative p-8 rounded-3xl border transition-all duration-500 bg-gradient-to-br shadow-xl shadow-stone-200/50 ${getGradient()}`}>
            
            {/* Mode Switcher */}
            <div className="flex justify-center gap-2 mb-8 bg-white/60 p-1.5 rounded-full w-fit mx-auto backdrop-blur-md border border-white/40 shadow-sm">
              <button
                onClick={() => switchMode(TimerMode.POMODORO)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${getButtonActiveStyle(TimerMode.POMODORO)}`}
              >
                <Brain size={14} /> Focus
              </button>
              <button
                onClick={() => switchMode(TimerMode.SHORT_BREAK)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${getButtonActiveStyle(TimerMode.SHORT_BREAK)}`}
              >
                <Coffee size={14} /> Short
              </button>
              <button
                onClick={() => switchMode(TimerMode.LONG_BREAK)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${getButtonActiveStyle(TimerMode.LONG_BREAK)}`}
              >
                <Armchair size={14} /> Long
              </button>
            </div>

            {/* Time Display */}
            <div className="text-center mb-8">
              <div className="text-[7rem] sm:text-[8rem] leading-none font-bold tracking-tighter font-mono tabular-nums text-stone-800 transition-colors duration-300 drop-shadow-sm">
                {formatTime(timeLeft)}
              </div>
              <p className={`mt-2 font-bold tracking-widest uppercase text-xs ${getTextColor()}`}>
                {isActive ? 'Sesión en curso' : 'Listo para empezar'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={toggleTimer}
                className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-stone-900 text-white hover:scale-105 transition-transform duration-200 active:scale-95 shadow-2xl shadow-stone-400/50"
              >
                {isActive ? (
                  <Pause size={32} fill="currentColor" className="ml-0.5" />
                ) : (
                  <Play size={32} fill="currentColor" className="ml-1" />
                )}
              </button>
              
              <button 
                onClick={resetTimer}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-stone-400 border border-stone-200 hover:bg-stone-50 hover:text-stone-800 hover:border-stone-300 transition-all shadow-sm"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
             <div className="flex flex-col">
               <span className="text-xs text-stone-500 uppercase tracking-wider font-bold">Sesiones Completadas</span>
               <span className="text-2xl font-bold text-stone-900 mt-1">{completedSessions}</span>
             </div>
             <div className="flex gap-1">
               {[...Array(Math.min(5, completedSessions))].map((_, i) => (
                 <CheckCircle2 key={i} size={20} className="text-rose-500" />
               ))}
               {completedSessions > 5 && (
                  <span className="text-xs text-stone-500 flex items-center font-mono bg-stone-100 px-2 rounded-full">+{completedSessions - 5}</span>
               )}
             </div>
          </div>

        </div>

        {/* Right Column: Atmosphere (Spotify) */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-1 relative rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xl min-h-[400px] lg:min-h-0">
             
             {/* Player Overlay Header */}
             <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/40 shadow-sm">
               <Music size={12} className="text-green-600" />
               <span className="text-xs font-bold text-stone-700">Spotify Chill Village</span>
             </div>

             {/* Spotify Iframe */}
             <div className="w-full h-full bg-[#282828]">
                <iframe 
                  style={{borderRadius: '0px'}} 
                  src={SPOTIFY_PLAYLIST_URL}
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  allowFullScreen 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                  title="Spotify Player"
                />
             </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 text-center shadow-sm">
            <p className="text-xs text-stone-500">
              Nota: El reproductor de Spotify requiere control manual. ¡Dale play para comenzar!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;