import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface WorkspaceRecord {
  userId: string;
  data: any;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const WORKSPACES_FILE = path.join(DATA_DIR, 'workspaces.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory caches with persistent disk backing
let users: UserRecord[] = [];
let workspaces: Record<string, WorkspaceRecord> = {};
const sessions = new Map<string, string>(); // token -> userId

// Load initial from disk
try {
  if (fs.existsSync(USERS_FILE)) {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    users = JSON.parse(raw);
  }
} catch (e) {
  console.warn('Error reading users file, starting empty', e);
  users = [];
}

try {
  if (fs.existsSync(WORKSPACES_FILE)) {
    const raw = fs.readFileSync(WORKSPACES_FILE, 'utf-8');
    workspaces = JSON.parse(raw);
  }
} catch (e) {
  console.warn('Error reading workspaces file, starting empty', e);
  workspaces = {};
}

function saveUsersToDisk() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist users to disk', err);
  }
}

function saveWorkspacesToDisk() {
  try {
    fs.writeFileSync(WORKSPACES_FILE, JSON.stringify(workspaces, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist workspaces to disk', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function createUser(email: string, password: string, name: string): { user: Omit<UserRecord, 'passwordHash' | 'salt'>; token: string } {
  const normalizedEmail = email.trim().toLowerCase();
  
  const existing = users.find(u => u.email === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address already exists. Please log in.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const id = 'usr_' + crypto.randomBytes(8).toString('hex');

  const newUser: UserRecord = {
    id,
    email: normalizedEmail,
    name: name.trim() || normalizedEmail.split('@')[0],
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsersToDisk();

  const token = 'tok_' + crypto.randomBytes(24).toString('hex');
  sessions.set(token, id);

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    },
    token,
  };
}

export function authenticateUser(email: string, password: string): { user: Omit<UserRecord, 'passwordHash' | 'salt'>; token: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email === normalizedEmail);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    throw new Error('Invalid email or password.');
  }

  const token = 'tok_' + crypto.randomBytes(24).toString('hex');
  sessions.set(token, user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    token,
  };
}

export function getUserByToken(token: string): Omit<UserRecord, 'passwordHash' | 'salt'> | null {
  const userId = sessions.get(token);
  if (!userId) return null;

  const user = users.find(u => u.id === userId);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

export function changeUserPassword(userId: string, currentPass: string, newPass: string): boolean {
  const user = users.find(u => u.id === userId);
  if (!user) {
    throw new Error('User not found.');
  }

  const computed = hashPassword(currentPass, user.salt);
  if (computed !== user.passwordHash) {
    throw new Error('The current password you entered is incorrect.');
  }

  if (newPass.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  user.salt = newSalt;
  user.passwordHash = hashPassword(newPass, newSalt);
  saveUsersToDisk();

  return true;
}

export function syncUserWorkspace(userId: string, data: any): WorkspaceRecord {
  const now = new Date().toISOString();
  const record: WorkspaceRecord = {
    userId,
    data,
    updatedAt: now,
  };

  workspaces[userId] = record;
  saveWorkspacesToDisk();
  return record;
}

export function getUserWorkspace(userId: string): WorkspaceRecord | null {
  return workspaces[userId] || null;
}

export function invalidateToken(token: string): void {
  sessions.delete(token);
}
