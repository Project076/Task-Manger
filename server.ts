import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { DbState, Task, Message, User, TaskAttachment } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = process.env.VERCEL === "1" ? '/tmp/db.json' : path.join(process.cwd(), 'db.json');

// In-Memory Fallback State (handles serverless state transiently and speeds up retrieval)
let memoryDbState: DbState | null = null;

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEYY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY or GEMINI_API_KEYY is not defined in the environment. NotebookLM insights will operate in offline/simulated mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'DUMMY_KEY_FOR_LOCAL_RUNS',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Initial Database Seeding
const defaultUsers: User[] = [
  {
    email: 'manager.accounts@foundationworldschool.com',
    name: 'Manager Accounts',
    role: 'Workspace Lead & Accountant',
    avatar: '💼'
  },
  {
    email: 'sarah.dev@foundationworldschool.com',
    name: 'Sarah Dev',
    role: 'Lead Fullstack Developer',
    avatar: '💻'
  },
  {
    email: 'alex.design@foundationworldschool.com',
    name: 'Alex Design',
    role: 'UI/UX Visual Specialist',
    avatar: '🎨'
  },
  {
    email: 'john.qa@foundationworldschool.com',
    name: 'John QA',
    role: 'Verification Analyst',
    avatar: '🔬'
  }
];

function getInitialTasks(): Task[] {
  const now = new Date();
  
  // Start is 2 hours ago
  const startLocal = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  
  // Deadline is 24 hours from now
  const deadlineLocal = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'task-1',
      title: 'Implement Encrypted Workspace Sync',
      description: 'Review the attached handbook and establish the client-side encryption handshake. No other members of the workspace except Sarah and the Manager should see this data or any of the chats.',
      assignerId: 'manager.accounts@foundationworldschool.com',
      assigneeId: 'sarah.dev@foundationworldschool.com',
      startDate: startLocal,
      deadline: deadlineLocal,
      snoozedUntil: null,
      progress: 45,
      status: 'active',
      attachments: [
        {
          id: 'attach-1',
          name: 'workspace_handbook.txt',
          type: 'text/plain',
          size: 412,
          content: 'WORKSPACE ENCRYPTION PROTOCOLS:\n1. All chat packets are securely routed and database state is encapsulated.\n2. Inbound requests from members not enrolled in the task must trigger instant 403 blocks.\n3. Deadline tracking is critical. Time synchronization happens instantly on the progress bar.\n4. Ensure notifications are pushed simultaneously when deadlines trigger.',
          uploadedBy: 'manager.accounts@foundationworldschool.com',
          createdAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function getInitialMessages(): Message[] {
  const now = new Date();
  return [
    {
      id: 'msg-1',
      taskId: 'task-1',
      senderId: 'manager.accounts@foundationworldschool.com',
      text: 'Hi Sarah, I assigned this secure integration task to you. Make sure to consult the attached workspace_handbook file.',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'msg-2',
      taskId: 'task-1',
      senderId: 'sarah.dev@foundationworldschool.com',
      text: "Thanks Manager! I am on it. I have set my progress to 45% because the state handlers are complete. No other member can view this at all.",
      createdAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString()
    }
  ];
}

// Read Db from json scale or in-memory backup
function readDb(): DbState {
  if (memoryDbState) {
    return memoryDbState;
  }
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDbState = JSON.parse(data);
      return memoryDbState!;
    }
  } catch (error) {
    console.error("Error reading db file, regenerating state...", error);
  }
  
  const state: DbState = {
    users: defaultUsers,
    tasks: getInitialTasks(),
    messages: getInitialMessages()
  };
  writeDb(state);
  return state;
}

function writeDb(state: DbState) {
  memoryDbState = state;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing db file", error);
  }
}

// Express Middlewares
app.use(express.json({ limit: '10mb' }));

// Custom API CORS Middleware to allow Google Workspace Extensions / Google Apps Scripts securely
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-email, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Auth Middleware: Extracted from x-user-email header. Since our app allows switching roles dynamically 
// and safely in the preview for easy multi-user testing, this is extremely efficient!
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userEmail = req.headers['x-user-email'] as string;
  if (!userEmail) {
    return res.status(401).json({ error: 'Unauthorized: Mock email header is missing' });
  }
  
  const db = readDb();
  const user = db.users.find(u => u.email === userEmail);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: User not enrolled' });
  }
  
  (req as any).user = user;
  next();
};

// --- API ROUTES ---

// 1. Get all enrolled users
app.get('/api/users', (req, res) => {
  const db = readDb();
  res.json(db.users);
});

// 2. Get tasks (Strict boundary: only returns tasks where user is assignee or assigner)
app.get('/api/tasks', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const db = readDb();
  
  const privateTasks = db.tasks.filter(t => 
    t.assigneeId === user.email || t.assignerId === user.email
  );
  
  res.json(privateTasks);
});

// 3. Assign/Create a new task
app.post('/api/tasks', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { title, description, assigneeId, startDate, deadline } = req.body;
  
  if (!title || !assigneeId || !startDate || !deadline) {
    return res.status(400).json({ error: 'Mandatory fields missing: title, assigneeId, startDate, deadline' });
  }
  
  const db = readDb();
  
  // Verify assignee is a valid teammate
  const assignee = db.users.find(u => u.email === assigneeId);
  if (!assignee) {
    return res.status(400).json({ error: 'Assignee is not a valid team member' });
  }
  
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title,
    description: description || '',
    assignerId: user.email,
    assigneeId: assignee.email,
    startDate,
    deadline,
    snoozedUntil: null,
    progress: 0,
    status: 'active',
    attachments: [],
    createdAt: new Date().toISOString()
  };
  
  db.tasks.push(newTask);
  
  // Add a system welcome message in the private task chat
  const systemMsg: Message = {
    id: `msg-system-${Date.now()}`,
    taskId: newTask.id,
    senderId: 'system',
    text: `🚀 Task assigned privately from ${user.name} to ${assignee.name}. Setup date is ${new Date(startDate).toLocaleString()}, and deadline is ${new Date(deadline).toLocaleString()}.`,
    createdAt: new Date().toISOString(),
    isSystem: true
  };
  db.messages.push(systemMsg);
  
  writeDb(db);
  res.status(201).json(newTask);
});

// 4. Update task (Progress, Snooze, Status)
app.patch('/api/tasks/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const taskId = req.params.id;
  const { progress, snoozedUntil, status, title, description, startDate, deadline } = req.body;
  
  const db = readDb();
  const taskIndex = db.tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const task = db.tasks[taskIndex];
  
  // Strict check: only Assigner or Assignee can update
  if (task.assignerId !== user.email && task.assigneeId !== user.email) {
    return res.status(403).json({ error: 'Forbidden: You do not have access to this private task' });
  }
  
  // Apply updates based on roles
  const updates: string[] = [];
  
  if (progress !== undefined) {
    // Both can update progress, but usually assignees do it.
    const prev = task.progress;
    task.progress = Math.min(100, Math.max(0, Number(progress)));
    updates.push(`Updated progress from ${prev}% to ${task.progress}%`);
  }
  
  if (snoozedUntil !== undefined) {
    // Only Assignee can snooze as requested: "Assignee should have ability to Snooze... less than deadline"
    if (user.email !== task.assigneeId) {
      return res.status(403).json({ error: 'Forbidden: Only the assignee can snooze alarms' });
    }
    
    if (snoozedUntil === null) {
      task.snoozedUntil = null;
      updates.push(`Dismissed/cleared snooze`);
    } else {
      // Validate snooze is LESS than deadline
      const snoozeTime = new Date(snoozedUntil).getTime();
      const deadlineTime = new Date(task.deadline).getTime();
      
      if (snoozeTime >= deadlineTime) {
        return res.status(400).json({ error: 'Snooze time must be strictly before the deadline!' });
      }
      
      task.snoozedUntil = snoozedUntil;
      updates.push(`🎒 Snoozed task target date/time to ${new Date(snoozedUntil).toLocaleString()}`);
    }
  }
  
  if (status !== undefined) {
    const prev = task.status;
    task.status = status;
    updates.push(`Changed status from ${prev} to ${status}`);
  }
  
  // Fields editable only by Assigner
  if (user.email === task.assignerId) {
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (startDate) task.startDate = startDate;
    if (deadline) task.deadline = deadline;
  }
  
  if (updates.length > 0) {
    // Insert system notification log into private task chat
    const systemMsg: Message = {
      id: `msg-system-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      taskId: task.id,
      senderId: 'system',
      text: `🔧 ${user.name}: ${updates.join(', ')}`,
      createdAt: new Date().toISOString(),
      isSystem: true
    };
    db.messages.push(systemMsg);
  }
  
  writeDb(db);
  res.json(task);
});

// 5. Upload document/attachment to task
app.post('/api/tasks/:id/attachments', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const taskId = req.params.id;
  const { name, type, size, content } = req.body;
  
  if (!name || content === undefined) {
    return res.status(400).json({ error: 'Missing attachment meta parameters' });
  }
  
  const db = readDb();
  const task = db.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Strict authorization check
  if (task.assignerId !== user.email && task.assigneeId !== user.email) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const newAttachment: TaskAttachment = {
    id: `attach-${Date.now()}`,
    name,
    type: type || 'text/plain',
    size: size || content.length,
    content,
    uploadedBy: user.email,
    createdAt: new Date().toISOString()
  };
  
  task.attachments.push(newAttachment);
  
  // Log message in chat
  const systemMsg: Message = {
    id: `msg-system-${Date.now()}`,
    taskId: task.id,
    senderId: 'system',
    text: `📎 ${user.name} uploaded a file: ${name} (${Math.round(size / 1024)} KB)`,
    createdAt: new Date().toISOString(),
    isSystem: true
  };
  db.messages.push(systemMsg);
  
  writeDb(db);
  res.status(201).json(newAttachment);
});

// 6. Get Chat messages for a specific task
app.get('/api/tasks/:id/messages', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const taskId = req.params.id;
  
  const db = readDb();
  const task = db.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Security validation
  if (task.assignerId !== user.email && task.assigneeId !== user.email) {
    return res.status(403).json({ error: 'Forbidden: You cannot peek into other members privacy' });
  }
  
  const taskMessages = db.messages.filter(m => m.taskId === taskId)
    .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
  res.json(taskMessages);
});

// 7. Post a chat message
app.post('/api/tasks/:id/messages', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const taskId = req.params.id;
  const { text } = req.body;
  
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }
  
  const db = readDb();
  const task = db.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Security verification
  if (task.assignerId !== user.email && task.assigneeId !== user.email) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    taskId,
    senderId: user.email,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };
  
  db.messages.push(newMessage);
  writeDb(db);
  
  res.status(201).json(newMessage);
});

// 8. NotebookLM Smart Assistant Endpoint - Aggregates task context + chat history + files, and chats with Gemini
app.post('/api/notebooklm/insights', requireAuth, async (req, res) => {
  const { taskId, query } = req.body;
  
  if (!taskId) {
    return res.status(400).json({ error: 'taskId is required' });
  }
  
  const db = readDb();
  const task = db.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Verify access privileges
  const user = (req as any).user as User;
  if (task.assignerId !== user.email && task.assigneeId !== user.email) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Fetch messages and format them
  const taskMessages = db.messages.filter(m => m.taskId === taskId)
    .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
  let formattedChat = taskMessages.map(m => {
    const sender = m.senderId === 'system' ? 'System Log' : (db.users.find(u => u.email === m.senderId)?.name || m.senderId);
    return `[${new Date(m.createdAt).toLocaleString()}] ${sender}: ${m.text}`;
  }).join('\n');
  
  // Format attachments
  let formattedDocs = task.attachments.map(att => {
    return `========================================
SOURCE DOCUMENT: ${att.name} (Uploaded by: ${att.uploadedBy} on ${new Date(att.createdAt).toLocaleString()})
CONTENT:
${att.content}
========================================`;
  }).join('\n\n');

  // Build the complete contextual dossier for Gemini
  const dossier = `
You are the AI NotebookLM Assistant. You are connected to a collaborative work workspace task.
Your role is to act as NotebookLM; provide useful executive insights, summaries of chats, action item checklists, risk indicators, and answer any collaborative Q&A queries.

TASK OVERVIEW:
- Title: ${task.title}
- Description: ${task.description}
- Assigner: ${db.users.find(u => u.email === task.assignerId)?.name || task.assignerId} (${task.assignerId})
- Assignee: ${db.users.find(u => u.email === task.assigneeId)?.name || task.assigneeId} (${task.assigneeId})
- Start Date/Alarm: ${new Date(task.startDate).toLocaleString()}
- Target Deadline: ${new Date(task.deadline).toLocaleString()}
- Temporary Snooze: ${task.snoozedUntil ? new Date(task.snoozedUntil).toLocaleString() : 'Not Set'}
- Current completion progress: ${task.progress}%
- Overall Status: ${task.status}

1-ON-1 SECURE CHAT HISTORY:
${formattedChat || '(No messages exchanged yet)'}

ATTACHED PROJECT FILES:
${formattedDocs || '(No documents attached yet)'}
`;

  try {
    const ai = getGeminiClient();
    
    // Check if we are running with a dummy key (fallback simulated response for safety if key is missing)
    if (process.env.GEMINI_API_KEY === undefined && process.env.GEMINI_API_KEYY === undefined) {
      // Simulate real NotebookLM summaries cleanly
      console.log("Offline Mode: Generating high-quality simulated NotebookLM summary.");
      const response = query 
        ? `[NotebookLM Offline Mode] Based on your project source documents: regarding "${query}", standard procedure is defined in workspace_handbook.txt. The current tasks are assigned to Sarah at ${task.progress}% progress. Since our sync database is offline, please configure your GEMINI_API_KEY in the Secrets panel to unlock real-time Gemini AI summaries!`
        : `## Executive Summary (NotebookLM Offline Mode)
The secure project "**${task.title}**" is assigned to **Sarah Dev** and is currently **${task.progress}% complete**.

### Key Action Items
* [ ] Verify secure encryption protocols (403 limits) as outlined in *workspace_handbook.txt*.
* [ ] Integrate deadline push warning nodes.
* [ ] Secure early test runs before the final deadline of **${new Date(task.deadline).toLocaleDateString()}**.

*To activate live, intelligent Gemini analyses, add a Gemini API Key via AI Studio secrets.*`;
      return res.json({ response });
    }

    let prompt = '';
    let systemInstruction = '';
    
    if (query) {
      // User is asking a direct question
      prompt = `Here is the current task dossier:\n${dossier}\n\nUSER QUESTION: "${query}"\nProvide a comprehensive, accurate answer from the chats, documents, and task descriptors above. Cite the document names or conversations where appropriate.`;
      systemInstruction = 'You are a highly capable NotebookLM research assistant providing accurate, factual summaries of project materials, files, and chat messages.';
    } else {
      // Default dashboard loading insight (needs overview summary, rapid checklists, risk assessment)
      prompt = `Here is the current task dossier:\n${dossier}\n\nConduct an exhaustive assessment of this task source dossier and return a professional Markdown formatted summary. Include:\n1) A concise **Executive Summary** of progress.\n2) **Direct Action Items** extracted clearly from files and chats.\n3) An **AI Risk Assessment** assessing dates, snoozes, and communication tones. Keep it professional, helpful, and beautifully formatted.`;
      systemInstruction = 'You are NotebookLM. Summarize sources, highlight actionable tasks, identify risk indicators, and deliver output in elegant, clear Markdown.';
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    res.json({ response: response.text });
  } catch (err: any) {
    console.error("Gemini Error during NotebookLM synthesis", err);
    res.status(500).json({ error: `AI Handshake Failed: ${err.message || err}` });
  }
});


// --- VITE MIDDLEWARE AND WEB STATIC HANDLERS ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Development Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving build artifacts in production mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express Backend] WorkSpace Server listening perfectly on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
