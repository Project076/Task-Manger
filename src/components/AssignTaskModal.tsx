import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Plus, Users, ClipboardCopy, FileText, Check, Shield } from 'lucide-react';
import { User } from '../types.js';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUserEmail: string;
  onTaskCreated: () => void;
  preselectedAssigneeEmail?: string;
}

export default function AssignTaskModal({ isOpen, onClose, users, currentUserEmail, onTaskCreated, preselectedAssigneeEmail }: AssignTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  
  // Set default start time to now, and deadline to 24h from now
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 2 * 60 * 1000).toISOString().slice(0, 16); // 2 mins from now
  const defaultDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16); // 24h from now
  
  const [startDate, setStartDate] = useState(defaultStart);
  const [deadline, setDeadline] = useState(defaultDeadline);

  useEffect(() => {
    if (isOpen) {
      if (preselectedAssigneeEmail) {
        setAssigneeId(preselectedAssigneeEmail);
      } else {
        setAssigneeId('');
      }
    }
  }, [isOpen, preselectedAssigneeEmail]);
  
  // Custom document textbox to attach initial files instantly!
  const [attachFileName, setAttachFileName] = useState('project_requirements.txt');
  const [attachContent, setAttachContent] = useState('');
  const [includeAttachment, setIncludeAttachment] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !assigneeId || !startDate || !deadline) {
      setError('Please complete all mandatory parameters.');
      return;
    }

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(deadline).getTime();

    if (startMs >= endMs) {
      setError('Error: The Final Deadline cannot be set before or identical to the Alarm Date/Time!');
      return;
    }

    setLoading(true);

    try {
      // 1. Create the Task
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUserEmail
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          assigneeId,
          startDate: new Date(startDate).toISOString(),
          deadline: new Date(deadline).toISOString()
        })
      });

      const taskData = await res.json();

      if (!res.ok) {
        throw new Error(taskData.error || 'Failed to delegate task');
      }

      // 2. Upload initial document if checkbox enabled
      if (includeAttachment && attachContent.trim()) {
        const attachRes = await fetch(`/api/tasks/${taskData.id}/attachments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUserEmail
          },
          body: JSON.stringify({
            name: attachFileName.trim() || 'project_requirements.txt',
            type: 'text/plain',
            size: attachContent.length,
            content: attachContent.trim()
          })
        });

        if (!attachRes.ok) {
          console.warn("Task created, but initial document upload failed.");
        }
      }

      // Clear state and success triggers
      setTitle('');
      setDescription('');
      setAssigneeId('');
      setAttachContent('');
      setIncludeAttachment(false);
      onTaskCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Allow assignment to any user, including oneself for self-directed tasks
  const sortedUsers = [...users].sort((a, b) => {
    if (a.email === currentUserEmail) return -1;
    if (b.email === currentUserEmail) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        id="assign_task_container"
      >
        {/* Form Header */}
        <div className="p-5 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500" />
          <div className="flex items-center gap-2.5">
            {assigneeId === currentUserEmail ? (
              <Shield className="w-5 h-5 text-indigo-400" />
            ) : (
              <Users className="w-5 h-5 text-fuchsia-400" />
            )}
            <h3 className="font-display font-bold text-white text-lg tracking-tight">
              {assigneeId === currentUserEmail ? (
                <span className="flex items-center gap-2">
                  Create Personal Task 
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono px-2 py-0.5 rounded-full uppercase font-black">
                    Self-Assigned
                  </span>
                </span>
              ) : 'Delegate Secure Task'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-805 hover:bg-zinc-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[75vh]">
          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-400 font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-mono uppercase tracking-wide">Task Heading *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Audit ledger logs or Deploy staging"
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Assignee Selection */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-mono uppercase tracking-wide">Assign Secure Teammate *</label>
            <select
              required
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="">-- Choose Confidential Team Recipient --</option>
              {sortedUsers.map(u => (
                <option key={u.email} value={u.email}>
                  {u.name} {u.email === currentUserEmail ? '💻 (Assign to Myself / Private Task)' : `(${u.role})`}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-500 italic mt-1 font-mono">
              🔒 Complete cryptographic shielding: Only the Assignee and Assigner can view or chat on this item.
            </p>
          </div>

          {/* Start Date and Deadline Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-mono uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Alarm Date/Time *
              </label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-mono uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                Final Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          {/* Task Detailed Guidelines */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-mono uppercase tracking-wide">Brief Guidelines / Action Prompts</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide clean instructions, parameters, and action prompts..."
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Document attachment slot */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-900 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAttachment}
                onChange={(e) => setIncludeAttachment(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 bg-zinc-950 border-zinc-800 rounded focus:ring-0"
              />
              <span className="text-xs font-semibold text-zinc-300 font-mono">
                Attach Initial NotebookLM Source (PDF/Doc/Text)
              </span>
            </label>

            <AnimatePresence>
              {includeAttachment && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden pt-1"
                >
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      value={attachFileName}
                      onChange={(e) => setAttachFileName(e.target.value)}
                      placeholder="e.g. compliance_rules.txt"
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-xs text-indigo-300 font-mono rounded"
                    />
                    <textarea
                      rows={3}
                      value={attachContent}
                      onChange={(e) => setAttachContent(e.target.value)}
                      placeholder="Paste instructions, code snippets, project memos, or text content here. NotebookLM will summarize and reference this document implicitly!"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded font-mono resize-none focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form Controls */}
          <div className="flex gap-3 justify-end pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 font-medium text-zinc-300 rounded-xl transition text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:from-indigo-700 active:to-purple-800 text-white font-semibold rounded-xl shadow-lg transition duration-150 text-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Complete Delegation</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
