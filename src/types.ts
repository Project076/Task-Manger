export interface User {
  email: string;
  name: string;
  role: string;
  avatar: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; // text content or metadata representing the attachment
  uploadedBy: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignerId: string; // User email
  assigneeId: string; // User email
  startDate: string; // ISO String (UTC or Local)
  deadline: string; // ISO String (UTC or Local)
  snoozedUntil: string | null; // ISO String, can be set by the assignee
  progress: number; // 0 to 100
  status: 'active' | 'completed' | 'overdue';
  attachments: TaskAttachment[];
  createdAt: string;
}

export interface Message {
  id: string;
  taskId: string;
  senderId: string; // User email
  text: string;
  createdAt: string;
  isSystem?: boolean;
}

export interface DbState {
  users: User[];
  tasks: Task[];
  messages: Message[];
}
