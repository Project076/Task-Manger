import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, Clock, BellOff, ArrowRight, ShieldAlert, BadgeCheck } from 'lucide-react';
import { Task } from '../types';

interface AlarmModalProps {
  task: Task;
  type: 'start' | 'deadline';
  onDismiss: () => void;
  onSnooze: (snoozeDate: string) => any;
  isAssignee: boolean;
  key?: string;
}

export default function AlarmModal({ task, type, onDismiss, onSnooze, isAssignee }: AlarmModalProps) {
  const [snoozeMinutes, setSnoozeMinutes] = useState('5');
  const [isSnoozing, setIsSnoozing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and play alarm synthesizer sound
  useEffect(() => {
    try {
      // Create Web Audio API context for alarm beeping
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Beep pulsing pattern
        let beepCount = 0;
        alarmIntervalRef.current = setInterval(() => {
          if (ctx.state === 'suspended') {
            ctx.resume();
          }

          // Generate simple dual frequencies synthesized beep
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc1.type = 'triangle';
          osc2.type = 'sine';

          // If deadline missed, play more urgent high pitch alarm!
          if (type === 'deadline') {
            osc1.frequency.value = 1000;
            osc2.frequency.value = 1500;
          } else {
            osc1.frequency.value = 600;
            osc2.frequency.value = 880;
          }

          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc1.start();
          osc2.start();
          osc1.stop(ctx.currentTime + 0.45);
          osc2.stop(ctx.currentTime + 0.455);
          
          beepCount++;
          // Auto shutoff alarm beep after 60 seconds of silence to prevent denial of workspace fatigue
          if (beepCount >= 120) {
            cleanup();
          }
        }, 800);
      }
    } catch (err) {
      console.error("Failed to construct audio context oscillator", err);
    }

    // Try triggering mobile hardware vibrator
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 300]);
    }

    return () => cleanup();
  }, [type]);

  const cleanup = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    }
  };

  const handleSnoozeSubmit = () => {
    const mins = parseInt(snoozeMinutes, 10);
    const now = new Date();
    const snoozeTime = new Date(now.getTime() + mins * 60 * 1000);
    
    // Check if snooze overflows deadline
    const deadlineTime = new Date(task.deadline).getTime();
    if (snoozeTime.getTime() >= deadlineTime) {
      alert("⚠️ Error: Snooze time must be strictly before the task deadline!");
      return;
    }
    
    onSnooze(snoozeTime.toISOString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg overflow-hidden bg-zinc-950 border-2 border-red-500 rounded-3xl animate-pulse-glow"
        id="alarm_container"
      >
        {/* Urgent Glowing Header */}
        <div className={`p-6 text-center text-white ${type === 'deadline' ? 'bg-gradient-to-r from-red-600 to-rose-700' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`}>
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-white/20 rounded-full animate-bounce">
              <BellRing className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wider">
            {type === 'deadline' ? '🚨 DEADLINE ALARM!' : '⏰ TASK ALARM TRIGGERED!'}
          </h2>
          <p className="text-white/80 text-xs mt-1 font-mono">
            {type === 'deadline' ? 'Missed / Final target complete' : 'Start / Scheduled session alert'}
          </p>
        </div>

        {/* Task Details and Meta Spec */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <span className="px-2.5 py-1 text-[10px] font-semibold text-rose-400 bg-rose-950/40 border border-rose-900 rounded-full font-mono uppercase tracking-widest">
              Private Channel Alert
            </span>
            <h3 className="text-xl font-bold text-zinc-100 font-display">
              {task.title}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
              {task.description}
            </p>
          </div>

          {/* Time logs */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div>
              <span className="text-zinc-500 text-[10px] block font-mono uppercase">Target Time</span>
              <span className="text-zinc-300 text-sm font-semibold">
                {new Date(type === 'deadline' ? task.deadline : (task.snoozedUntil || task.startDate)).toLocaleTimeString()}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block font-mono uppercase">Deadline</span>
              <span className="text-zinc-300 text-sm font-semibold text-rose-400">
                {new Date(task.deadline).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Show snooze trigger is assignee only of start timer */}
            {type === 'start' && isAssignee && (
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Snooze Settings (Must be before deadline)</span>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={snoozeMinutes}
                    onChange={(e) => setSnoozeMinutes(e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 text-sm text-zinc-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="1">Snooze 1 Minute (QA Testing)</option>
                    <option value="5">Snooze 5 Minutes</option>
                    <option value="15">Snooze 15 Minutes</option>
                    <option value="30">Snooze 30 Minutes</option>
                    <option value="60">Snooze 1 Hour</option>
                  </select>
                  <button
                    onClick={handleSnoozeSubmit}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-zinc-950 text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5"
                  >
                    <span>Snooze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* General Action Bar */}
            <div className="flex gap-3">
              <button
                onClick={onDismiss}
                className="flex-1 py-3 text-center bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-2xl border border-zinc-700 transition duration-150 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <BellOff className="w-4 h-4 text-zinc-400" />
                <span>Dismiss Audio Alert</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
