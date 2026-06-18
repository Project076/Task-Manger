import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, LogIn, Lock, ShieldCheck, Mail, Calendar, Hourglass, 
  Sparkles, FileUp, Send, CheckCircle2, UserCheck, AlertTriangle, 
  Play, Bell, VolumeX, Volume2, Info, ArrowUpRight, HelpCircle, 
  Check, Archive, RefreshCw, Layers, FileText, Image, Download, Eye, Paperclip,
  Search, Filter
} from 'lucide-react';
import { Task, Message, User, TaskAttachment } from './types';
import AlarmModal from './components/AlarmModal';
import NotebookLMDrawer from './components/NotebookLMDrawer';
import AssignTaskModal from './components/AssignTaskModal';
import GmailIntegrationModal from './components/GmailIntegrationModal';

export const formatDateDDMMYYYY = (dateInput: Date | string | number | undefined | null) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateTimeDDMMYYYY = (dateInput: Date | string | number | undefined | null) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const dateStr = formatDateDDMMYYYY(d);
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} ${timeStr}`;
};

export const getTaskColorTheme = (taskTitle: string) => {
  const hash = Array.from(taskTitle || "Default").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const themes = [
    {
      borderColor: 'border-l-4 border-l-cyan-400',
      tagBg: 'bg-cyan-950/45 border-cyan-800 text-cyan-300',
      badgeBg: 'bg-cyan-500 text-zinc-950',
      glow: 'shadow-[0_0_15px_-4px_rgba(34,211,238,0.35)] border-cyan-500/30',
      progressFrom: 'from-cyan-500',
      progressTo: 'to-blue-500',
      accentColor: 'text-cyan-400',
      gradientCard: 'from-cyan-950/20 via-zinc-900/90 to-zinc-950',
      textGlow: 'text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]',
      progressGlow: 'shadow-[0_0_10px_rgba(6,182,212,0.4)]'
    },
    {
      borderColor: 'border-l-4 border-l-emerald-400',
      tagBg: 'bg-emerald-950/45 border-emerald-800 text-emerald-300',
      badgeBg: 'bg-emerald-500 text-zinc-950',
      glow: 'shadow-[0_0_15px_-4px_rgba(52,211,153,0.35)] border-emerald-500/30',
      progressFrom: 'from-emerald-500',
      progressTo: 'to-teal-500',
      accentColor: 'text-emerald-400',
      gradientCard: 'from-emerald-950/20 via-zinc-900/90 to-zinc-950',
      textGlow: 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]',
      progressGlow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]'
    },
    {
      borderColor: 'border-l-4 border-l-violet-400',
      tagBg: 'bg-violet-950/45 border-violet-800 text-violet-300',
      badgeBg: 'bg-violet-500 text-zinc-950',
      glow: 'shadow-[0_0_15px_-4px_rgba(167,139,250,0.35)] border-violet-500/30',
      progressFrom: 'from-violet-500',
      progressTo: 'to-indigo-500',
      accentColor: 'text-violet-400',
      gradientCard: 'from-violet-950/20 via-zinc-900/90 to-zinc-950',
      textGlow: 'text-violet-400 drop-shadow-[0_0_6px_rgba(167,139,250,0.5)]',
      progressGlow: 'shadow-[0_0_10px_rgba(139,92,246,0.4)]'
    },
    {
      borderColor: 'border-l-4 border-l-amber-400',
      tagBg: 'bg-amber-950/45 border-amber-800 text-amber-300',
      badgeBg: 'bg-amber-500 text-zinc-950',
      glow: 'shadow-[0_0_15px_-4px_rgba(251,191,36,0.35)] border-amber-500/30',
      progressFrom: 'from-amber-500',
      progressTo: 'to-orange-500',
      accentColor: 'text-amber-400',
      gradientCard: 'from-amber-950/20 via-zinc-900/90 to-zinc-950',
      textGlow: 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]',
      progressGlow: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]'
    },
    {
      borderColor: 'border-l-4 border-l-rose-400',
      tagBg: 'bg-rose-950/45 border-rose-800 text-rose-300',
      badgeBg: 'bg-rose-500 text-zinc-950',
      glow: 'shadow-[0_0_15px_-4px_rgba(251,113,133,0.35)] border-rose-500/30',
      progressFrom: 'from-rose-500',
      progressTo: 'to-pink-500',
      accentColor: 'text-rose-400',
      gradientCard: 'from-rose-950/20 via-zinc-900/90 to-zinc-950',
      textGlow: 'text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]',
      progressGlow: 'shadow-[0_0_10px_rgba(244,63,94,0.4)]'
    },
    {
      borderColor: 'border-l-4 border-l-fuchsia-400',
      tagBg: 'bg-fuchsia-950/45 border-fuchsia-800 text-fuchsia-300',
      badgeBg: 'bg-fuchsia-500 text-zinc-950',
      glow: 'shadow-[0_0_15px_-4px_rgba(232,121,249,0.35)] border-fuchsia-500/30',
      progressFrom: 'from-fuchsia-500',
      progressTo: 'to-purple-500',
      accentColor: 'text-fuchsia-400',
      gradientCard: 'from-fuchsia-950/20 via-zinc-900/90 to-zinc-950',
      textGlow: 'text-fuchsia-400 drop-shadow-[0_0_6px_rgba(232,121,249,0.5)]',
      progressGlow: 'shadow-[0_0_10px_rgba(217,70,239,0.4)]'
    }
  ];
  return themes[hash % themes.length];
};

export default function App() {
  // Enrolled Users list from backend
  const [users, setUsers] = useState<User[]>([]);
  // Simulated authentication: State representing Current Logged-in Teammate
  const [activeUser, setActiveUser] = useState<User | null>(null);
  
  // Tasks vectors
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Search and filter states
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState<'all' | 'own' | 'asked'>('all');
  
  // Chats & messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Modal visibility
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);
  
  // Document uploading / pasting state
  const [uploadingTextFile, setUploadingTextFile] = useState(false);
  const [pastedDocName, setPastedDocName] = useState('audit_logs.txt');
  const [pastedDocContent, setPastedDocContent] = useState('');

  // Gmail drag-and-drop / manual link state
  const [isDraggingGmail, setIsDraggingGmail] = useState(false);
  const [uploadingGmailManual, setUploadingGmailManual] = useState(false);
  const [gmailManualUrl, setGmailManualUrl] = useState('');
  const [gmailManualSubject, setGmailManualSubject] = useState('');
  const [preselectedAssigneeEmail, setPreselectedAssigneeEmail] = useState<string | undefined>(undefined);
  const [gmailIntegrationOpen, setGmailIntegrationOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Real-time toast list
  const [toasts, setToasts] = useState<Array<{ id: string; text: string; type: 'success' | 'warn' | 'info' }>>([]);
  
  // Alarm Trigger Queue Tracker
  const [triggeredAlarms, setTriggeredAlarms] = useState<Array<{ task: Task; type: 'start' | 'deadline' }>>([]);
  
  // Avoid duplicate alarms triggering in the exact same minutes
  const [acknowledgedAlarms, setAcknowledgedAlarms] = useState<Record<string, boolean>>({});

  // Refs for scrolling and drag drop
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load: Fetch Team Members
  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Set default active user to manager.accounts when list arrives
  useEffect(() => {
    if (users.length > 0 && !activeUser) {
      // Find the logged-in email from the prompt metadata if possible or default to first
      const defaultUser = users.find(u => u.email === 'manager.accounts@foundationworldschool.com') || users[0];
      setActiveUser(defaultUser);
      addToast(`👋 Enrolled into Secure Session: Logged in as ${defaultUser.name}`, 'info');
    }
  }, [users]);

  // 3. Main Data Poller: Sync status, progress percentages, chats, snoozes instantly every 3 seconds!
  useEffect(() => {
    if (!activeUser) return;
    
    // Fetch instantly and trigger interval
    fetchTasksAndChats();
    const interval = setInterval(() => {
      fetchTasksAndChats(true); // silent pool
    }, 3000);

    return () => clearInterval(interval);
  }, [activeUser?.email, selectedTask?.id]);

  // 4. Real-time Alarm Engine: runs verification cycle every 1 second
  useEffect(() => {
    if (!activeUser || tasks.length === 0) return;

    const alarmInterval = setInterval(() => {
      const now = new Date();
      
      tasks.forEach(task => {
        // Complete tasks do not trigger alarms
        if (task.progress >= 100 || task.status === 'completed') return;

        const isAssignee = task.assigneeId === activeUser.email;
        const isAssigner = task.assignerId === activeUser.email;

        // Check A: Start Date Alarm (or Snoozed date) -> Assignee's phone or desktop only!
        const alarmTargetStr = task.snoozedUntil || task.startDate;
        const alarmTime = new Date(alarmTargetStr).getTime();
        const alarmKey = `${task.id}-start-${alarmTargetStr}`;

        if (isAssignee && now.getTime() >= alarmTime && !acknowledgedAlarms[alarmKey]) {
          // Trigger assignee alarm!
          setTriggeredAlarms(prev => {
            const exists = prev.some(a => a.task.id === task.id && a.type === 'start');
            if (!exists) return [...prev, { task, type: 'start' }];
            return prev;
          });
          addToast(`⏰ DATE ALARM: Target time reached for "${task.title}"`, 'warn');
          
          // Seal so it does not trigger again
          setAcknowledgedAlarms(prev => ({ ...prev, [alarmKey]: true }));
        }

        // Check B: Deadline Alarm -> rings on BOTH devices assignee and assigner + push simulation!
        const deadlineTime = new Date(task.deadline).getTime();
        const deadlineKey = `${task.id}-deadline-${task.deadline}`;

        if ((isAssignee || isAssigner) && now.getTime() >= deadlineTime && !acknowledgedAlarms[deadlineKey]) {
          // Trigger deadline alarm!
          setTriggeredAlarms(prev => {
            const exists = prev.some(a => a.task.id === task.id && a.type === 'deadline');
            if (!exists) return [...prev, { task, type: 'deadline' }];
            return prev;
          });
          
          addToast(`🚨 TIMELINE OVERDUE: Task deadline breached for "${task.title}"! Triggering simultaneously on Assigner and Assignee accounts.`, 'warn');
          
          setAcknowledgedAlarms(prev => ({ ...prev, [deadlineKey]: true }));
        }
      });
    }, 1000);

    return () => clearInterval(alarmInterval);
  }, [activeUser?.email, tasks, acknowledgedAlarms]);

  // Scroll chat to bottom with spring when updates come in
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addToast = (text: string, type: 'success' | 'warn' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error("Error communicating with authentication databases", err);
    }
  };

  const fetchTasksAndChats = async (silent = false) => {
    if (!activeUser) return;
    try {
      // 1. Fetch encrypted task lists
      const res = await fetch('/api/tasks', {
        headers: {
          'x-user-email': activeUser.email
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data);
        
        // Match active selected task schema mapping
        if (selectedTask) {
          const freshTask = data.find((t: Task) => t.id === selectedTask.id);
          if (freshTask) {
            setSelectedTask(freshTask);
          }
        } else if (!selectedTask && data.length > 0 && !silent) {
          setSelectedTask(data[0]); // auto select first task
        }
      }

      // 2. Fetch messages if task selected
      if (selectedTask) {
        const msgRes = await fetch(`/api/tasks/${selectedTask.id}/messages`, {
          headers: {
            'x-user-email': activeUser.email
          }
        });
        const msgData = await msgRes.json();
        if (msgRes.ok) {
          setMessages(msgData);
        }
      }
    } catch (err) {
      console.error("Polling network synchronization failed", err);
    }
  };

  // Assignee slider update triggers instant server-client sync loop!
  const handleProgressChange = async (newVal: number) => {
    if (!selectedTask || !activeUser) return;
    
    // Safety: assignee updates progress
    if (activeUser.email !== selectedTask.assigneeId) {
      addToast("⛔ Integrity Lock: Only the Assignee can shift completion percentages.", "warn");
      return;
    }

    // Optimistic UI state sync
    const updatedTask = { ...selectedTask, progress: newVal };
    setSelectedTask(updatedTask);
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, progress: newVal } : t));

    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeUser.email
        },
        body: JSON.stringify({ progress: newVal })
      });
      if (res.ok) {
        // Broadcast complete
        if (newVal === 100) {
          addToast("🎉 Secure progression reaches 100%! Completed task synchronized.", "success");
        }
      }
    } catch (err) {
      console.error("Failed to commit progress update", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !activeUser || !chatInput.trim()) return;

    const textToSend = chatInput.trim();
    setChatInput('');

    // Optimistically update
    const mockMsg: Message = {
      id: `msg-mock-${Date.now()}`,
      taskId: selectedTask.id,
      senderId: activeUser.email,
      text: textToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, mockMsg]);

    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeUser.email
        },
        body: JSON.stringify({ text: textToSend })
      });
      if (!res.ok) {
        addToast("⚠️ Packet upload disconnect, message failed to send.", "warn");
      } else {
        fetchTasksAndChats(true);
      }
    } catch (err) {
      console.error("Error committing private message logs", err);
    }
  };

  const handleDocumentPasteSubmit = async () => {
    if (!selectedTask || !activeUser || !pastedDocContent.trim()) return;

    const fName = pastedDocName.trim() || 'project_audit.txt';
    const content = pastedDocContent.trim();
    
    setPastedDocContent('');
    setUploadingTextFile(false);
    addToast(`📎 Syncing Document "${fName}" to task dossier...`, 'info');

    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeUser.email
        },
        body: JSON.stringify({
          name: fName,
          type: 'text/plain',
          size: content.length,
          content: content
        })
      });

      if (res.ok) {
        addToast(`✅ Document successfully uploaded! Connected to NotebookLM.`, 'success');
        fetchTasksAndChats(true);
      } else {
        addToast(`⛔ Document rejection. Verify credentials.`, 'warn');
      }
    } catch (err) {
      console.error("Attachment sync failure", err);
    }
  };

  const handleGmailAttachmentUpload = async (subject: string, url: string) => {
    if (!selectedTask || !activeUser) return;

    addToast(`📧 Linking Gmail Dossier: "${subject}"...`, 'info');

    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeUser.email
        },
        body: JSON.stringify({
          name: `Gmail: ${subject}`,
          type: 'application/gmail',
          size: url.length,
          content: url
        })
      });

      if (res.ok) {
        addToast(`✅ Gmail thread successfully linked to NotebookLM!`, 'success');
        setGmailManualUrl('');
        setGmailManualSubject('');
        setUploadingGmailManual(false);
        fetchTasksAndChats(true);
      } else {
        const errData = await res.json();
        addToast(`⛔ Gmail link rejection: ${errData.error || 'Verify security'}`, 'warn');
      }
    } catch (err) {
      console.error("Gmail attachment sync failure", err);
      addToast(`⛔ Network error while linking Gmail`, 'warn');
    }
  };

  const processFiles = async (files: FileList) => {
    if (!selectedTask || !activeUser) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 8 * 1024 * 1024) {
        addToast(`⚠️ "${file.name}" is too large! Maximum limit is 8 MB.`, 'warn');
        continue;
      }

      setUploadingFile(true);
      addToast(`📎 Syncing file "${file.name}" to task...`, 'info');

      try {
        const base64Content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to read file as string'));
            }
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });

        const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': activeUser.email
          },
          body: JSON.stringify({
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            content: base64Content
          })
        });

        if (res.ok) {
          addToast(`✅ "${file.name}" attached successfully!`, 'success');
          fetchTasksAndChats(true);
        } else {
          const errData = await res.json();
          addToast(`⛔ Failed to attach "${file.name}": ${errData.error || 'Server error'}`, 'warn');
        }
      } catch (err) {
        console.error("File upload failure", err);
        addToast(`❌ Error processing "${file.name}"`, 'warn');
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(files);
  };

  const handleGmailDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGmail(false);

    const rawUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('URL') || e.dataTransfer.getData('text/plain');
    const rawText = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/html');

    if (!rawUrl) {
      addToast("🔔 No droplet metadata received. Try dragging raw browser URL or copying email link.", "warn");
      return;
    }

    let decodedUrl = rawUrl.trim();
    if (decodedUrl.includes('\n')) {
      decodedUrl = decodedUrl.split('\n')[0].trim();
    }

    const isGmailLink = decodedUrl.includes('mail.google.com') || decodedUrl.includes('gmail.com');
    
    if (isGmailLink) {
      let subject = "Encrypted Message Thread";
      if (rawText && rawText.trim() !== decodedUrl) {
        const cleanedText = rawText.replace(/<[^>]*>/g, '').trim();
        if (cleanedText && cleanedText.length < 150 && !cleanedText.includes('http')) {
          subject = cleanedText;
        }
      }
      
      await handleGmailAttachmentUpload(subject, decodedUrl);
    } else {
      if (decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) {
        const customSubject = prompt("Linked Teammate Thread Detected! Enter description/name for this external document:", "Secure Workspace Link");
        if (customSubject) {
          await handleGmailAttachmentUpload(customSubject, decodedUrl);
        }
      } else {
        addToast("🔔 Dropped item did not contain a valid mail.google.com link.", "info");
      }
    }
  };

  const handleIdentitySwitch = (newUser: User) => {
    setActiveUser(newUser);
    setSelectedTask(null);
    setMessages([]);
    setTriggeredAlarms([]); // reset visible alarms
    addToast(`🔑 Identity swapped: Acting as ${newUser.name} (${newUser.role})`, 'success');
  };

  // Custom simulator: Instant alarm scheduler (Highly convenient interactive testing tool!)
  const triggerSimulatedAlarm = async (type: 'start' | 'deadline') => {
    if (!selectedTask || !activeUser) return;
    
    const now = new Date();
    // Schedule exactly 2 seconds from now to show it triggers
    const triggerTime = new Date(now.getTime() + 2 * 1000).toISOString();
    
    addToast(`⚙️ SIMULATOR: Scheduling ${type === 'deadline' ? 'Hard Deadline' : 'Alarm'} in 2 seconds. Keep app tab open!`, 'info');
    
    try {
      const updatePayload = type === 'deadline' 
        ? { deadline: triggerTime }
        : { startDate: triggerTime, snoozedUntil: null };

      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeUser.email
        },
        body: JSON.stringify(updatePayload)
      });
      
      if (res.ok) {
        const updated = await res.json();
        // Force state sync
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
        setSelectedTask(updated);
        
        // Remove from locally acknowledged so it triggers again cleanly
        const key = type === 'deadline' 
          ? `${selectedTask.id}-deadline-${triggerTime}`
          : `${selectedTask.id}-start-${triggerTime}`;
          
        setAcknowledgedAlarms(prev => {
          const fresh = { ...prev };
          delete fresh[key];
          return fresh;
        });
      }
    } catch (err) {
      console.error("Simulator error", err);
    }
  };

  // Snooze Alarm Action Callback
  const handleAlarmSnooze = async (taskId: string, snoozeDate: string) => {
    if (!activeUser) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeUser.email
        },
        body: JSON.stringify({ snoozedUntil: snoozeDate })
      });
      if (res.ok) {
        addToast(`🎒 Alarm successfully snoozed until ${new Date(snoozeDate).toLocaleTimeString()}`, 'success');
        setTriggeredAlarms(prev => prev.filter(a => a.task.id !== taskId));
        fetchTasksAndChats(true);
      } else {
        const errData = await res.json();
        alert(`Snooze error: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dismiss / Clear Alarm
  const handleDismissAlarm = (taskId: string) => {
    setTriggeredAlarms(prev => prev.filter(a => a.task.id !== taskId));
    addToast("🔔 Audio alarm sound synthesizers dismissed.", "info");
  };

  // Categorize tasks into "My Tasks" (assigned to me, including self-assigned tasks) and "Assigned Tasks" (delegated to others)
  const myTasks = tasks.filter(t => t.assigneeId === activeUser?.email);
  const assignedTasks = tasks.filter(t => t.assignerId === activeUser?.email && t.assigneeId !== activeUser?.email);

  const matchesSearch = (t: Task) => {
    if (!taskSearchQuery.trim()) return true;
    const query = taskSearchQuery.toLowerCase();
    
    const titleMatch = t.title.toLowerCase().includes(query);
    const descMatch = (t.description || '').toLowerCase().includes(query);
    
    const assigneeMatch = users.find(u => u.email === t.assigneeId)?.name.toLowerCase().includes(query) || t.assigneeId.toLowerCase().includes(query);
    const assignerMatch = users.find(u => u.email === t.assignerId)?.name.toLowerCase().includes(query) || t.assignerId.toLowerCase().includes(query);
    
    return titleMatch || descMatch || assigneeMatch || assignerMatch;
  };

  const displayedMyTasks = myTasks.filter(matchesSearch);
  const displayedAssignedTasks = assignedTasks.filter(matchesSearch);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none antialiased relative overflow-hidden">
      {/* Dynamic Floating Colorful Ambient Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-violet-700/10 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[55%] h-[55%] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Toast Alert Popups container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`p-4 rounded-xl border shadow-2xl flex items-start gap-2 text-xs pointer-events-auto ${
                toast.type === 'success' 
                  ? 'bg-emerald-950/90 border-emerald-800 text-emerald-300' 
                  : toast.type === 'warn'
                  ? 'bg-amber-950/90 border-amber-800 text-amber-300 animate-pulse'
                  : 'bg-zinc-900/90 border-zinc-700 text-zinc-300'
              }`}
            >
              <Bell className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="font-semibold">{toast.text}</p>
                <span className="text-[9px] text-zinc-500 font-mono italic">Simulated Push Notification</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Alarm Modals Rendering System */}
      <AnimatePresence>
        {triggeredAlarms.map((alarm) => (
          <AlarmModal
            key={`${alarm.task.id}-${alarm.type}`}
            task={alarm.task}
            type={alarm.type}
            onDismiss={() => handleDismissAlarm(alarm.task.id)}
            onSnooze={(snoozeDate) => handleAlarmSnooze(alarm.task.id, snoozeDate)}
            isAssignee={alarm.task.assigneeId === activeUser?.email}
          />
        ))}
      </AnimatePresence>

      {/* Main Workspace Bar */}
      <header className="p-4 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        {/* Dynamic neon linear color banner */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 via-indigo-500 via-purple-500 via-pink-500 to-emerald-450 shadow-[0_1px_12px_rgba(168,85,247,0.4)]" />
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 via-purple-605 to-fuchsia-600 border border-indigo-400/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base tracking-tight text-white flex items-center flex-wrap gap-2">
              Confidential Task Assigner & Chat
              <span className="text-[10px] px-2.5 py-0.5 bg-gradient-to-r from-emerald-505 to-teal-500 text-zinc-950 font-black rounded-full font-mono uppercase tracking-widest leading-none shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                Zero-Trust Shield
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-mono">
              Military-Grade Privacy Shielding for Team Deliverables
            </p>
          </div>
        </div>

        {/* Identity Selector widget (For simple simulation testing) */}
        {activeUser && (
          <div className="flex items-center gap-2 bg-gradient-to-br from-indigo-950/25 via-zinc-900/90 to-purple-950/25 p-2 rounded-2xl border border-indigo-500/30 max-w-full shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all duration-300">
            <div className="flex items-center gap-2 px-2">
              <div className="p-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full animate-pulse">
                <span className="text-xl select-none">{activeUser.avatar}</span>
              </div>
              <div className="text-left leading-none">
                <span className="text-xs font-bold text-white block truncate max-w-[130px] sm:max-w-[180px]">
                  {activeUser.name}
                </span>
                <span className="text-[9px] font-mono truncate block max-w-[130px] sm:max-w-[180px] uppercase font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                  {activeUser.role}
                </span>
              </div>
            </div>

            {/* Quick switcher menu */}
            <div className="h-6 w-[1px] bg-indigo-500/25 mx-1" />
            
            <div className="relative group">
              <button className="px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 active:scale-[0.98] text-[10px] sm:text-xs font-bold text-indigo-300 font-mono rounded-xl border border-indigo-400/35 flex items-center gap-1.5 transition shadow-[0_0_10px_rgba(139,92,246,0.15)] cursor-pointer">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Test Switch Teammate</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-64 bg-zinc-950/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl shadow-[0_10px_30px_rgba(139,92,246,0.25)] opacity-0 scale-95 pointer-events-none group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:pointer-events-auto group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-155 z-30 p-2 space-y-1">
                <div className="p-2 border-b border-zinc-805 text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-black">
                  Switch Active Role
                </div>
                {users.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => handleIdentitySwitch(u)}
                    className={`w-full p-2 rounded-lg text-left flex items-center gap-2.5 transition text-xs ${
                      u.email === activeUser.email 
                        ? 'bg-gradient-to-r from-indigo-950 to-purple-950 text-indigo-250 border border-indigo-800/65 font-bold shadow-inner' 
                        : 'hover:bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-base shrink-0">{u.avatar}</span>
                    <div className="truncate">
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-[9px] text-zinc-500 font-mono truncate">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Container Layout */}
      {activeUser ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1600px] w-full mx-auto relative z-10">
          
          {/* LEFT COLUMN: Private Task Inbox */}
          <aside className="w-full lg:w-[360px] bg-zinc-950/40 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-zinc-900 flex flex-col p-4 space-y-4 shrink-0 overflow-y-auto">
            
            {/* Quick summary check with multi-colored design */}
            <div className="flex justify-between items-center bg-gradient-to-br from-indigo-950/30 via-zinc-900/65 to-purple-950/30 p-4 rounded-2xl border border-indigo-950/30 shrink-0 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all duration-500" />
              <div className="relative z-10">
                <p className="text-zinc-500 text-[9px] font-mono uppercase tracking-wide">My Secured Envelope</p>
                <p className="text-base font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-indigo-350">
                  {myTasks.length + assignedTasks.length} Private Tasks
                </p>
              </div>
              <button
                onClick={() => setAssignModalOpen(true)}
                className="p-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 active:scale-[0.97] transition-all duration-150 text-white rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.35)] flex items-center gap-1.5 shrink-0"
                id="btn_delegate_task"
              >
                <Plus className="w-4 h-4 font-bold" />
                <span className="text-[10px] font-black uppercase tracking-wider">Assign</span>
              </button>
            </div>

            {/* Search and Filters Section */}
            <div className="space-y-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  id="task_search_input"
                  type="text"
                  placeholder="Search tasks or assignee..."
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 bg-zinc-900/60 border border-zinc-805/85 rounded-xl text-xs text-zinc-250 placeholder-zinc-500 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-150"
                />
                {taskSearchQuery && (
                  <button
                    onClick={() => setTaskSearchQuery('')}
                    className="absolute right-3 top-2 text-xs text-zinc-400 hover:text-zinc-200 font-mono font-bold font-black"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-1 bg-zinc-900/40 p-1 rounded-xl border border-zinc-900/80">
                <button
                  id="filter_all"
                  onClick={() => setTaskTypeFilter('all')}
                  className={`py-1 text-[10px] font-bold font-mono uppercase rounded-lg transition-all duration-150 text-center cursor-pointer ${
                    taskTypeFilter === 'all'
                      ? 'bg-zinc-800 text-indigo-400 border border-zinc-700/60 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  All ({myTasks.length + assignedTasks.length})
                </button>
                <button
                  id="filter_own"
                  onClick={() => setTaskTypeFilter('own')}
                  className={`py-1 text-[10px] font-bold font-mono uppercase rounded-lg transition-all duration-150 text-center cursor-pointer ${
                    taskTypeFilter === 'own'
                      ? 'bg-zinc-800 text-indigo-400 border border-zinc-700/60 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Own ({myTasks.length})
                </button>
                <button
                  id="filter_asked"
                  onClick={() => setTaskTypeFilter('asked')}
                  className={`py-1 text-[10px] font-bold font-mono uppercase rounded-lg transition-all duration-150 text-center cursor-pointer ${
                    taskTypeFilter === 'asked'
                      ? 'bg-zinc-800 text-indigo-400 border border-zinc-700/60 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Asked ({assignedTasks.length})
                </button>
              </div>
            </div>

            {/* My Tasks container (Assigned to Me / Self-assigned) */}
            {(taskTypeFilter === 'all' || taskTypeFilter === 'own') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/45 border border-indigo-900/50 rounded-lg font-mono flex items-center gap-1.5 w-max">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    My Tasks — {displayedMyTasks.length} {taskSearchQuery && 'found'}
                  </span>

                  <button
                    id="btn_add_my_own_task"
                    onClick={() => {
                      setPreselectedAssigneeEmail(activeUser.email);
                      setAssignModalOpen(true);
                    }}
                    className="px-2 py-1 bg-indigo-950/40 hover:bg-indigo-950/80 active:scale-[0.98] border border-indigo-500/30 text-indigo-300 font-mono text-[9px] font-black uppercase rounded-lg tracking-wider transition-all duration-150 flex items-center gap-1 hover:border-indigo-500/60 cursor-pointer"
                  >
                    <Plus className="w-3" />
                    <span>+ Add Personal Task</span>
                  </button>
                </div>
                
                {displayedMyTasks.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-zinc-900/10 border border-dashed border-zinc-900 text-center text-zinc-500 text-xs py-6 font-mono w-full">
                    {taskSearchQuery ? 'No matching personal tasks found.' : 'No tasks assigned to you yet.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayedMyTasks.map((task) => {
                      const theme = getTaskColorTheme(task.title);
                      const isSelected = selectedTask?.id === task.id;
                      const assigneeUser = users.find(u => u.email === task.assigneeId);

                      return (
                        <div
                          key={task.id}
                          id={`task_${task.id}`}
                          onClick={() => { setSelectedTask(task); setNotebookOpen(false); }}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col gap-2 relative ${theme.borderColor} ${
                            isSelected
                              ? `bg-zinc-900/95 border-zinc-700 ${theme.glow}`
                              : `bg-zinc-900/40 border-zinc-900/60 hover:border-zinc-800 hover:bg-zinc-900/60`
                          }`}
                        >
                          {/* Title and Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-xs font-display font-bold leading-snug line-clamp-1 flex-1 ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                              {task.title}
                            </h4>
                            <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded leading-none shrink-0 ${theme.tagBg}`}>
                              {task.progress}%
                            </span>
                          </div>

                          {/* Condensed Details Grid */}
                          <div className="grid grid-cols-1 gap-1 py-1 border-t border-zinc-900/40 text-[9px] font-mono leading-none">
                            {/* Assignee */}
                            <div className="flex items-center gap-1 text-zinc-400">
                              <span className="text-zinc-500 uppercase tracking-wider font-extrabold text-[8px]">Assignee:</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] leading-none select-none">{assigneeUser?.avatar || '👤'}</span>
                                <span className="text-zinc-300 font-bold max-w-[150px] truncate">
                                  {task.assigneeId === activeUser.email ? 'Me (Own Task)' : (assigneeUser?.name || task.assigneeId)}
                                </span>
                              </div>
                            </div>

                            {/* Start and Dead Line Row */}
                            <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-900/20">
                              <div className="flex items-center gap-1">
                                <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-extrabold">Start:</span>
                                <span className="text-zinc-300">{formatDateDDMMYYYY(task.startDate || task.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-rose-350">
                                <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-extrabold">Due:</span>
                                <span className="font-bold">{formatDateDDMMYYYY(task.deadline)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Minimal Progress Line */}
                          <div className="w-full bg-zinc-950 rounded-full h-[3px] overflow-hidden font-mono">
                            <div 
                              className={`h-full bg-gradient-to-r ${theme.progressFrom} ${theme.progressTo} rounded-full`} 
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Assigned Tasks container (Delegated to others) */}
            {(taskTypeFilter === 'all' || taskTypeFilter === 'asked') && (
              <div className="space-y-3">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 bg-fuchsia-950/45 border border-fuchsia-900/50 rounded-lg font-mono flex items-center gap-1.5 w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping" />
                  Assigned Tasks — {displayedAssignedTasks.length} {taskSearchQuery && 'found'}
                </span>

                {displayedAssignedTasks.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-zinc-900/10 border border-dashed border-zinc-900 text-center text-zinc-500 text-xs py-6 font-mono w-full">
                    {taskSearchQuery ? 'No matching assigned tasks found.' : 'No tasks delegated yet. Select Assign to delegate some.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayedAssignedTasks.map((task) => {
                      const theme = getTaskColorTheme(task.title);
                      const isSelected = selectedTask?.id === task.id;
                      const assigneeUser = users.find(u => u.email === task.assigneeId);

                      return (
                        <div
                          key={task.id}
                          id={`task_${task.id}`}
                          onClick={() => { setSelectedTask(task); setNotebookOpen(false); }}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col gap-2 relative ${theme.borderColor} ${
                            isSelected
                              ? `bg-zinc-900/95 border-zinc-700 ${theme.glow}`
                              : `bg-zinc-900/40 border-zinc-900/60 hover:border-zinc-800 hover:bg-zinc-900/60`
                          }`}
                        >
                          {/* Title and Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-xs font-display font-bold leading-snug line-clamp-1 flex-1 ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                              {task.title}
                            </h4>
                            <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded leading-none shrink-0 ${theme.tagBg}`}>
                              {task.progress}%
                            </span>
                          </div>

                          {/* Condensed Details Grid */}
                          <div className="grid grid-cols-1 gap-1 py-1 border-t border-zinc-900/40 text-[9px] font-mono leading-none">
                            {/* Assignee */}
                            <div className="flex items-center gap-1 text-zinc-400">
                              <span className="text-zinc-500 uppercase tracking-wider font-extrabold text-[8px]">Assignee:</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] leading-none select-none">{assigneeUser?.avatar || '👤'}</span>
                                <span className="text-zinc-300 font-bold max-w-[150px] truncate">
                                  {assigneeUser?.name || task.assigneeId}
                                </span>
                              </div>
                            </div>

                            {/* Start and Dead Line Row */}
                            <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-900/20 font-mono">
                              <div className="flex items-center gap-1 font-mono">
                                <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-extrabold font-black font-mono">Start:</span>
                                <span className="text-zinc-300 font-mono">{formatDateDDMMYYYY(task.startDate || task.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-rose-350 font-mono">
                                <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-extrabold font-black font-mono">Due:</span>
                                <span className="font-bold font-mono">{formatDateDDMMYYYY(task.deadline)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Minimal Progress Line */}
                          <div className="w-full bg-zinc-950 rounded-full h-[3px] overflow-hidden font-mono">
                            <div 
                              className={`h-full bg-gradient-to-r ${theme.progressFrom} ${theme.progressTo} rounded-full`} 
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Instructions box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border border-indigo-500/20 text-xs leading-relaxed text-indigo-300 font-mono space-y-1.5 shrink-0 mt-auto shadow-[0_0_15px_rgba(99,102,241,0.06)]">
              <div className="flex items-center gap-1.5 font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300 animate-pulse">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Confidential Security Key</span>
              </div>
              <p className="text-[10px] leading-relaxed text-zinc-400">
                Task objects are isolated at API level. Attempting to query or inspect tasks where you are not assigner or assignee returns strict 403 blocks. Change identities in UI to verify boundaries live!
              </p>
            </div>
          </aside>

          {/* CENTER PANEL: Workspace details */}
          <main className="flex-1 bg-zinc-950 flex flex-col overflow-hidden">
            {selectedTask ? (() => {
              const currentTaskTheme = getTaskColorTheme(selectedTask.title);
              return (
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Scrollable details panel */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col">
                  
                  {/* Task Meta and Details Dashboard */}
                  <div className={`p-6 rounded-3xl border space-y-6 flex-shrink-0 shadow-2xl bg-gradient-to-br ${currentTaskTheme.gradientCard} border-zinc-800/80 transition-all duration-300 ${currentTaskTheme.glow}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full font-mono uppercase tracking-widest border ${currentTaskTheme.tagBg}`}>
                          Task Workspace Detail
                        </span>
                        <h2 className={`text-xl sm:text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r ${currentTaskTheme.progressFrom} ${currentTaskTheme.progressTo} leading-tight tracking-tight drop-shadow-md`}>
                          {selectedTask.title}
                        </h2>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 font-mono text-xs text-zinc-500">
                          <span>Delegator: <strong className="text-zinc-300">{users.find(u => u.email === selectedTask.assignerId)?.name}</strong></span>
                          <span>Assignee: <strong className={`${currentTaskTheme.accentColor} font-bold`}>{users.find(u => u.email === selectedTask.assigneeId)?.name}</strong></span>
                        </div>
                      </div>

                      {/* Launch NotebookLM Trigger */}
                      <button
                        onClick={() => setNotebookOpen(true)}
                        className={`py-2.5 px-4 font-bold rounded-xl shadow-lg transition duration-150 flex items-center justify-center gap-2 self-start text-xs uppercase tracking-wider cursor-pointer ${currentTaskTheme.badgeBg} hover:opacity-90 active:scale-[0.98]`}
                      >
                        <Sparkles className="w-4 h-4 animate-pulse text-zinc-950" />
                        <span>Launch NotebookLM insights</span>
                      </button>
                    </div>

                    {/* Guidelines Description Text */}
                    <div className={`text-sm text-zinc-300 leading-relaxed bg-zinc-950/95 p-4 rounded-2xl border-y border-r border-zinc-850 ${currentTaskTheme.borderColor} shadow-inner`}>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-1.5 font-bold">Guidelines Dossier</div>
                      <p className="select-text whitespace-pre-wrap">{selectedTask.description || 'No detailed instructions provided.'}</p>
                    </div>

                    {/* Interactive Completion Percentage Progress Bar */}
                    <div className="space-y-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-850 relative overflow-hidden group">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-zinc-400 flex items-center gap-1">
                          <CheckCircle2 className={`w-4 h-4 ${currentTaskTheme.accentColor}`} />
                          Completion Progress Bar
                        </span>
                        <span className={`font-mono font-bold px-2.5 py-0.5 rounded border text-sm shadow-sm ${currentTaskTheme.tagBg}`}>
                          {selectedTask.progress}% Complete
                        </span>
                      </div>

                      {/* Customizable bar */}
                      <div className="h-4 w-full bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 relative">
                        <div 
                          className={`h-full bg-gradient-to-r ${currentTaskTheme.progressFrom} ${currentTaskTheme.progressTo} ${currentTaskTheme.progressGlow} animate-progress transition-all duration-300`}
                          style={{ width: `${selectedTask.progress}%` }}
                        />
                      </div>

                      {/* Interactive percentage input (Assignee update controls) */}
                      {activeUser.email === selectedTask.assigneeId ? (
                        <div className="space-y-3 pt-1.5">
                          <input
                            id="progress_drag_range"
                            type="range"
                            min="0"
                            max="100"
                            value={selectedTask.progress}
                            onChange={(e) => handleProgressChange(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                            <span>0% Not Started</span>
                            <span>Slide to synchronize progress in real-time across devices</span>
                            <span>100% Finished</span>
                          </div>

                          {/* Quick progress preset elements */}
                          <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-zinc-900/60">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold pr-1">Presets:</span>
                            {[0, 25, 50, 75, 100].map((val) => {
                              const isActive = selectedTask.progress === val;
                              return (
                                <button
                                  key={val}
                                  id={`btn_set_progress_${val}`}
                                  onClick={() => handleProgressChange(val)}
                                  className={`flex-1 py-1 text-[10px] font-mono font-bold rounded-lg border transition-all duration-150 cursor-pointer text-center ${
                                    isActive
                                      ? `${currentTaskTheme.tagBg} shadow-inner scale-[1.03] border-zinc-700`
                                      : 'bg-zinc-900 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-800/60'
                                  }`}
                                >
                                  {val}%
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-zinc-900/40 rounded-xl text-[10px] text-zinc-500 font-mono italic text-center">
                          🔒 Progress sync: Only Assignee ({users.find(u => u.email === selectedTask.assigneeId)?.name}) can shift this progress bar.
                        </div>
                      )}
                    </div>

                    {/* Clock, Deadlines, & Snooze Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Times Card */}
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Alarm Timestamps</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Alarm Date:</span>
                              <span className="font-mono text-zinc-300">
                                {formatDateTimeDDMMYYYY(selectedTask.startDate)}
                              </span>
                            </div>
                            {selectedTask.snoozedUntil && (
                              <div className="flex justify-between text-amber-400">
                                <span className="font-semibold">Snoozed Until:</span>
                                <span className="font-mono">
                                  {formatDateTimeDDMMYYYY(selectedTask.snoozedUntil)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-rose-400 font-medium border-t border-zinc-900 pt-1 mt-1">
                              <span>Final Deadline:</span>
                              <span className="font-mono">
                                {formatDateTimeDDMMYYYY(selectedTask.deadline)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Assignee Snooze quick actions */}
                        {activeUser.email === selectedTask.assigneeId && (
                          <div className="pt-2 border-t border-zinc-900 flex justify-between items-center">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">Interactive Snooze</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  const targetDate = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
                                  if (targetDate.getTime() >= new Date(selectedTask.deadline).getTime()) {
                                    addToast("❌ Snooze exceeds deadline limit!", "warn");
                                    return;
                                  }
                                  handleAlarmSnooze(selectedTask.id, targetDate.toISOString());
                                }}
                                className="px-2 py-1 bg-amber-950/40 border border-amber-900 text-amber-300 text-[10px] font-bold font-mono rounded hover:bg-amber-950 transition"
                              >
                                +2m Snooze
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Interactive Simulator Card (FOR FASTER TESTING AUDIT!) */}
                      <div className="p-4 rounded-2xl bg-indigo-950/5 border border-indigo-950/50 space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-semibold flex items-center gap-1">
                            <Bell className="w-3 h-3 animate-pulse" />
                            Alarms Simulator Panel
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-normal">
                            Instantly rewrite database timestamps to 2 seconds from now to review alarm modal sound loop.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => triggerSimulatedAlarm('start')}
                            className="p-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-zinc-950 font-bold rounded-xl text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Alarm In 2s</span>
                          </button>
                          <button
                            onClick={() => triggerSimulatedAlarm('deadline')}
                            className="p-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1"
                          >
                            <Hourglass className="w-3 h-3" />
                            <span>Deadline In 2s</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Attachments list with Paste file integration */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-zinc-400 flex items-center gap-1">
                          Connected Attachments ({selectedTask.attachments.length})
                        </h4>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            id="btn_gmail_native_integration"
                            onClick={() => setGmailIntegrationOpen(true)}
                            className="px-3 py-1 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-mono text-[10px] font-bold rounded-lg transition-all duration-150 flex items-center gap-1 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.25)] border border-red-500/20"
                          >
                            <Mail className="w-3 h-3 animate-bounce" />
                            <span>Gmail Add-On 🔌</span>
                          </button>

                          <button
                            id="btn_link_gmail_link"
                            onClick={() => { setUploadingGmailManual(!uploadingGmailManual); setUploadingTextFile(false); }}
                            className={`px-3 py-1 font-mono text-[10px] rounded transition cursor-pointer ${
                              uploadingGmailManual ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-red-950/30 text-rose-300 hover:bg-red-950/60'
                            }`}
                          >
                            {uploadingGmailManual ? 'Cancel Gmail Paste' : '+ Link Gmail Thread'}
                          </button>
                          
                          <button
                            id="btn_paste_text_file"
                            onClick={() => { setUploadingTextFile(!uploadingTextFile); setUploadingGmailManual(false); }}
                            className={`px-3 py-1 font-mono text-[10px] rounded transition cursor-pointer ${
                              uploadingTextFile ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-zinc-850 text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            {uploadingTextFile ? 'Cancel File Paste' : '+ Paste Text File'}
                          </button>
                        </div>
                      </div>

                      {/* Manual Gmail thread Link pasted slot */}
                      <AnimatePresence>
                        {uploadingGmailManual && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 overflow-hidden"
                          >
                            <div>
                              <input
                                id="gmail_manual_subject"
                                type="text"
                                value={gmailManualSubject}
                                onChange={(e) => setGmailManualSubject(e.target.value)}
                                placeholder="Audit Query Regarding Q2 Accounts"
                                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs text-rose-350 font-mono rounded focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div>
                              <input
                                id="gmail_manual_url"
                                type="url"
                                value={gmailManualUrl}
                                onChange={(e) => setGmailManualUrl(e.target.value)}
                                placeholder="https://mail.google.com/mail/u/0/#inbox/FMfcgzGvx..."
                                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono rounded focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                id="btn_submit_gmail_link"
                                onClick={() => {
                                  if (gmailManualUrl && gmailManualSubject) {
                                    handleGmailAttachmentUpload(gmailManualSubject, gmailManualUrl);
                                  } else {
                                    addToast("⚠️ Please enter both subject and full Gmail URL.", "warn");
                                  }
                                }}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded transition uppercase tracking-wider cursor-pointer"
                              >
                                Attach Gmail Link
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
 
                       {/* Paste textbox slot */}
                       <AnimatePresence>
                         {uploadingTextFile && (
                           <motion.div
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: 'auto', opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 overflow-hidden"
                           >
                             <div className="flex gap-2">
                               <input
                                 id="pasted_doc_name"
                                 type="text"
                                 value={pastedDocName}
                                 onChange={(e) => setPastedDocName(e.target.value)}
                                 placeholder="audit_ledger.txt"
                                 className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs text-indigo-300 font-mono rounded focus:outline-none animate-pulse"
                               />
                             </div>
                             <textarea
                               id="pasted_doc_content"
                               rows={3}
                               value={pastedDocContent}
                               onChange={(e) => setPastedDocContent(e.target.value)}
                               placeholder="Paste document text content, guidelines, specs or mail paragraphs here... NotebookLM reads this instantly!"
                               className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded font-mono resize-none focus:outline-none focus:border-indigo-500"
                             />
                             <div className="flex justify-end gap-2">
                               <button
                                 id="btn_submit_pasted_doc"
                                 onClick={handleDocumentPasteSubmit}
                                 disabled={!pastedDocContent.trim()}
                                 className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-800 text-zinc-950 font-bold text-xs rounded transition uppercase tracking-wider cursor-pointer"
                               >
                                 Link to Task dossier
                               </button>
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>

                       {/* Upgraded Dual Drag & Drop Zones */}
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {/* Gmail Thread Link dropzone */}
                         <div
                           id="gmail_dropzone"
                           onDragOver={(e) => {
                             e.preventDefault();
                             setIsDraggingGmail(true);
                           }}
                           onDragLeave={() => {
                             setIsDraggingGmail(false);
                           }}
                           onDrop={handleGmailDrop}
                           className={`p-4 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                             isDraggingGmail
                               ? 'bg-red-950/25 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] scale-[0.99]'
                               : 'bg-zinc-950/40 border-zinc-900/80 hover:border-zinc-800 hover:bg-zinc-905'
                           }`}
                         >
                           <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className={`p-2.5 rounded-xl mb-1.5 transition-transform duration-300 flex items-center justify-center ${
                             isDraggingGmail ? 'bg-red-500 text-zinc-950 scale-110 animate-bounce' : 'bg-red-950/40 text-red-400'
                           }`}>
                             <Mail className="w-4 h-4 animate-pulse" />
                           </div>
                           
                           <p className={`text-xs font-bold transition-colors ${isDraggingGmail ? 'text-rose-400' : 'text-zinc-200'}`}>
                             {isDraggingGmail ? 'Drop email link here now!' : 'Drag & Drop Gmail Thread'}
                           </p>
                           <p className="text-[9px] text-zinc-500 font-mono mt-0.5 max-w-[280px]">
                             Supports browser URL & email tab link drops
                           </p>
                         </div>

                         {/* General Documents & Pictures Zone */}
                         <div
                           id="general_file_dropzone"
                           onClick={() => fileInputRef.current?.click()}
                           onDragOver={(e) => {
                             e.preventDefault();
                             setIsDraggingFile(true);
                           }}
                           onDragLeave={() => {
                             setIsDraggingFile(false);
                           }}
                           onDrop={async (e) => {
                             e.preventDefault();
                             setIsDraggingFile(false);
                             if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                               await processFiles(e.dataTransfer.files);
                             }
                           }}
                           className={`p-4 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                             isDraggingFile
                               ? 'bg-indigo-950/25 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-[0.99]'
                               : 'bg-zinc-950/40 border-zinc-900/80 hover:border-zinc-800 hover:bg-zinc-905'
                           }`}
                         >
                           <input
                             type="file"
                             ref={fileInputRef}
                             onChange={handleFileUpload}
                             className="hidden"
                             multiple
                             accept="image/*,application/pdf,text/plain,application/json,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                           />
                           
                           <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className={`p-2.5 rounded-xl mb-1.5 transition-transform duration-300 flex items-center justify-center ${
                             isDraggingFile ? 'bg-indigo-500 text-zinc-950 scale-110 animate-pulse' : 'bg-indigo-950/40 text-indigo-400'
                           }`}>
                             <FileUp className="w-4 h-4 animate-pulse" />
                           </div>
                           
                           <p className={`text-xs font-bold transition-colors ${isDraggingFile ? 'text-indigo-400' : 'text-zinc-200'}`}>
                             {isDraggingFile ? 'Drop file here now!' : 'Attach Documents & Pictures'}
                           </p>
                           <p className="text-[9px] text-zinc-500 font-mono mt-0.5 max-w-[280px]">
                             Drag & Drop files or click to browse
                           </p>
                         </div>
                       </div>
 
                       {/* Attachments visual card render */}
                       {selectedTask.attachments.length === 0 ? (
                         <div className="p-3 bg-zinc-950 rounded-xl border border-dashed border-zinc-900 text-center text-zinc-650 text-xs font-mono">
                           No document attached. Attached items feed automatically into NotebookLM workspace.
                         </div>
                       ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                           {selectedTask.attachments.map((file) => {
                             const isGmail = file.type === 'application/gmail' || file.name.startsWith('Gmail:') || file.content.includes('mail.google.com');
                             const elementId = `attachment-item-${file.id}`;

                             if (isGmail) {
                               return (
                                 <a 
                                   key={file.id}
                                   id={elementId}
                                   href={file.content} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="p-3.5 rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800 hover:border-red-900/50 hover:bg-red-950/10 flex items-start gap-2.5 transition-all duration-200 group relative cursor-pointer active:scale-[0.98]"
                                 >
                                   {/* Gmail red identity pill */}
                                   <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-950/40 border border-red-900/50 rounded-full px-2 py-0.5">
                                     <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                     <span className="text-[8px] font-mono font-bold text-red-400 uppercase tracking-wider">MAPPED</span>
                                   </div>

                                   <div className="p-2 bg-red-950/35 text-red-400 rounded-lg group-hover:bg-red-950/60 transition">
                                     <Mail className="w-4 h-4" />
                                   </div>
                                   
                                   <div className="flex-1 min-w-0 pr-12">
                                     <span className="font-bold text-zinc-100 text-xs block truncate group-hover:text-red-300 transition" title={file.name.replace('Gmail: ', '')}>
                                       {file.name.replace('Gmail: ', '')}
                                     </span>
                                     <span className="text-[9px] text-zinc-500 block font-mono mt-0.5">
                                      Gmail Secure Key • {formatDateDDMMYYYY(file.createdAt)}
                                     </span>
                                     
                                     <div className="mt-1.5 flex items-center gap-1 text-[10px] text-red-400 font-mono font-bold">
                                       <span>Open in Gmail</span>
                                       <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                     </div>
                                   </div>
                                 </a>
                               );
                             }

                             const isDataUrl = file.content?.startsWith('data:');
                             const isImage = file.type?.startsWith('image/') || (isDataUrl && file.content.startsWith('data:image/'));

                             if (isImage) {
                               return (
                                 <div 
                                   key={file.id} 
                                   id={elementId} 
                                   className="p-3 rounded-xl bg-gradient-to-br from-zinc-900/65 to-zinc-950 border border-zinc-800 hover:border-indigo-500/30 flex items-start gap-2.5 transition-all duration-200 group relative"
                                 >
                                   <div className="relative w-12 h-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-zinc-850 bg-zinc-900" onClick={() => setPreviewImage(file.content)}>
                                     <img 
                                       src={file.content} 
                                       alt={file.name}
                                       className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                       referrerPolicy="no-referrer"
                                     />
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                       <Eye className="w-4 h-4 text-white" />
                                     </div>
                                   </div>

                                   <div className="flex-1 min-w-0">
                                     <span className="font-bold text-zinc-200 text-xs block truncate" title={file.name}>
                                       {file.name}
                                     </span>
                                     <span className="text-[10px] text-zinc-500 block font-mono mt-0.5 animate-pulse">
                                       {file.size ? `${Math.round(file.size / 1024)} KB` : 'Attached Picture'} • {file.type.split('/')[1] || 'image'}
                                     </span>

                                     <div className="mt-2 flex items-center gap-3">
                                       <button
                                         onClick={() => setPreviewImage(file.content)}
                                         className="text-[10px] font-mono font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1"
                                       >
                                         <Eye className="w-3 h-3" />
                                         <span>Zoom</span>
                                       </button>

                                       <a
                                         href={file.content}
                                         download={file.name}
                                         className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1"
                                       >
                                         <Download className="w-3 h-3" />
                                         <span>Download</span>
                                       </a>
                                     </div>
                                   </div>
                                 </div>
                               );
                             }

                             return (
                               <div key={file.id} id={elementId} className="p-3.5 rounded-xl bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-zinc-800 flex items-start gap-2.5">
                                 <div className="p-2 bg-indigo-950/40 text-indigo-400 rounded-lg">
                                   <FileText className="w-4 h-4" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <span className="font-semibold text-zinc-200 text-xs block truncate" title={file.name}>
                                     {file.name}
                                   </span>
                                   <span className="text-[10px] text-zinc-500 block font-mono mt-0.5 animate-pulse">
                                     {file.size ? `${Math.round(file.size / 1024)} KB` : 'Dossier Core'} • {file.type.split('/')[1] || 'document'}
                                   </span>
                                   
                                   {isDataUrl ? (
                                     <div className="mt-2 flex items-center justify-between bg-zinc-900/80 p-1.5 px-2.5 rounded-lg border border-zinc-850">
                                       <span className="text-[9px] font-mono text-zinc-400 flex items-center gap-1">
                                         <Paperclip className="w-3 h-3 text-indigo-400" />
                                         Secure binary file
                                       </span>
                                       <a 
                                         href={file.content} 
                                         download={file.name}
                                         className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer bg-emerald-950/20 border border-emerald-900/50 px-2 py-0.5 rounded"
                                       >
                                         <Download className="w-3 h-3" />
                                         <span>Download</span>
                                       </a>
                                     </div>
                                   ) : (
                                     <div className="mt-1.5 p-1 px-2 bg-zinc-900 rounded border border-zinc-850 text-[10px] text-zinc-400 font-mono line-clamp-2 leading-relaxed select-text">
                                       {file.content}
                                     </div>
                                   )}
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       )}
                     </div>
                  </div>
                </div>

                {/* Right side: 1-on-1 secured private chat panel */}
                <div className="w-full md:w-[380px] bg-zinc-950 p-4 border-t md:border-t-0 md:border-l border-zinc-900 flex flex-col overflow-hidden shrink-0">
                  <div className="pb-3 border-b border-zinc-900 shrink-0 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-display font-semibold text-zinc-200 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        Confidential Chat Room
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono">Only delegator & recipient enrolled</p>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center text-zinc-600 py-12 space-y-2">
                        <Mail className="w-8 h-8 opacity-25" />
                        <p className="text-xs font-mono">Room established securely. Send a message to initiate the handshake.</p>
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.senderId === activeUser.email;
                        
                        // Render system logs differently
                        if (m.isSystem) {
                          return (
                            <div key={m.id} className="p-2 mx-2 bg-indigo-950/15 border border-indigo-950 text-[10px] text-indigo-300 font-mono rounded">
                              {m.text}
                            </div>
                          );
                        }

                        const senderUser = users.find(u => u.email === m.senderId);

                        return (
                          <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            {/* Sender badge header */}
                            <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 mb-1 px-1">
                              <span>{senderUser?.name || m.senderId}</span>
                              <span>•</span>
                              <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            {/* Text card */}
                            <div 
                              className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] select-text ${
                                isMe 
                                  ? 'bg-indigo-600 text-white font-medium border border-indigo-500 shadow-md' 
                                  : 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                              }`}
                            >
                              {m.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatScrollRef} />
                  </div>

                  {/* chat typing bar */}
                  <form onSubmit={handleSendMessage} className="pt-3 border-t border-zinc-900 shrink-0 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Send private secure message..."
                      className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-750 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-950 font-bold rounded-xl transition flex items-center justify-center shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                </div>
              );
            })() : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-zinc-950">
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-full mb-4">
                  <ShieldCheck className="w-10 h-10 text-indigo-400 animate-pulse" />
                </div>
                <h3 className="font-display font-bold text-lg text-zinc-200">
                  Select Private Workspace task
                </h3>
                <p className="text-sm text-zinc-500 max-w-sm mt-1">
                  Enrolled items belong exclusively to assigner and assignee. Choose or delegate a clean item to initiate.
                </p>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="mt-4 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-750 text-zinc-950 font-semibold text-xs rounded-xl uppercase tracking-wider transition"
                >
                  Delegate Secure Task +
                </button>
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR: Sliding NotebookLM smart Source insights */}
          {selectedTask && (
            <NotebookLMDrawer
              task={selectedTask}
              isOpen={notebookOpen}
              onClose={() => setNotebookOpen(false)}
              activeUserEmail={activeUser.email}
            />
          )}

          {/* Secure Delegator form modal */}
          <AssignTaskModal
            isOpen={assignModalOpen}
            onClose={() => {
              setAssignModalOpen(false);
              setPreselectedAssigneeEmail(undefined);
            }}
            users={users}
            currentUserEmail={activeUser.email}
            preselectedAssigneeEmail={preselectedAssigneeEmail}
            onTaskCreated={() => {
              fetchTasksAndChats();
              addToast("🚀 Task assigned securely! Chat room generated.", "success");
            }}
          />

          {/* Gmail API Integration overlay helper */}
          <GmailIntegrationModal
            isOpen={gmailIntegrationOpen}
            onClose={() => setGmailIntegrationOpen(false)}
            users={users}
            activeUser={activeUser}
            onSuccessToast={(msg) => addToast(msg, 'success')}
            onTaskCreated={() => fetchTasksAndChats(false)}
          />

          {/* Picture attachments visual lightbox preview overlay modal */}
          <AnimatePresence>
            {previewImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewImage(null)}
                className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 cursor-zoom-out"
              >
                <div className="absolute top-4 right-4 flex items-center gap-4 text-zinc-400">
                  <span className="text-xs font-mono">Click anywhere to close zoom</span>
                  <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-850 text-white">
                    ✕
                  </button>
                </div>
                <motion.img
                  initial={{ scale: 0.9, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 10 }}
                  src={previewImage}
                  alt="High-resolution attachment view"
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-zinc-800 select-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-zinc-500 font-mono text-xs mt-2">Connecting secure workspace databases ...</p>
        </div>
      )}
    </div>
  );
}
