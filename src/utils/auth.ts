import { UserProfile } from '../types';

const STORAGE_KEY_AUTH_USER = 'oc_auth_user_v1';
const STORAGE_KEY_AUTH_TOKEN = 'oc_auth_token_v1';
const STORAGE_KEY_GUEST_DISMISSED = 'oc_auth_guest_dismissed_v1';
const STORAGE_KEY_USERS_DB = 'oc_users_db_v1';

export function loadStoredAuth(): { user: UserProfile | null; token: string | null } {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    const token = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
    if (rawUser && token) {
      return {
        user: JSON.parse(rawUser),
        token,
      };
    }
  } catch (err) {
    console.warn('Failed to load stored auth credentials', err);
  }
  return { user: null, token: null };
}

export function saveStoredAuth(user: UserProfile, token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);
    localStorage.removeItem(STORAGE_KEY_GUEST_DISMISSED);
  } catch (err) {
    console.warn('Failed to save auth credentials', err);
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
  } catch (err) {
    console.warn('Failed to clear auth credentials', err);
  }
}

export function isGuestDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_GUEST_DISMISSED) === 'true';
  } catch {
    return false;
  }
}

export function setGuestDismissed(dismissed: boolean): void {
  try {
    if (dismissed) {
      localStorage.setItem(STORAGE_KEY_GUEST_DISMISSED, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY_GUEST_DISMISSED);
    }
  } catch {
    // Ignore
  }
}

// Client-side Users DB helper
function getUsersDb(): Record<string, { user: UserProfile; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsersDb(db: Record<string, { user: UserProfile; passwordHash: string }>): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(db));
  } catch {
    // Ignore
  }
}

export async function clientSignUp(email: string, password: string, name?: string): Promise<{ user: UserProfile; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const db = getUsersDb();

  if (db[normalizedEmail]) {
    throw new Error('This email address is already registered. Please log in instead.');
  }

  const userId = 'user_' + Math.random().toString(36).substring(2, 10);
  const user: UserProfile = {
    id: userId,
    email: normalizedEmail,
    name: name?.trim() || normalizedEmail.split('@')[0],
    createdAt: new Date().toISOString(),
  };

  db[normalizedEmail] = {
    user,
    passwordHash: password, // simple storage for demo / client mode
  };
  saveUsersDb(db);

  const token = 'token_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return { user, token };
}

export async function clientLogIn(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const db = getUsersDb();

  const record = db[normalizedEmail];
  if (!record || record.passwordHash !== password) {
    throw new Error('Invalid email or password. Please check your credentials.');
  }

  const token = 'token_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return { user: record.user, token };
}

export async function clientGoogleSignIn(): Promise<{ user: UserProfile; token: string }> {
  const randomNum = Math.floor(Math.random() * 10000);
  const email = `google_user_${randomNum}@gmail.com`;
  const name = 'Google Scholar';
  return await clientSignUp(email, 'google_oauth_pass', name);
}

export async function apiChangePassword(token: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const authState = loadStoredAuth();
  if (!authState.user) {
    throw new Error('No authenticated user found.');
  }
  const normalizedEmail = authState.user.email.toLowerCase();
  const db = getUsersDb();
  const record = db[normalizedEmail];

  if (!record || record.passwordHash !== currentPassword) {
    throw new Error('Current password is incorrect.');
  }

  record.passwordHash = newPassword;
  saveUsersDb(db);
  return { success: true, message: 'Password updated successfully.' };
}

export async function apiPushUserSync(token: string, data: any): Promise<{ updatedAt: string }> {
  try {
    const updatedAt = new Date().toISOString();
    localStorage.setItem('oc_user_cloud_sync_data', JSON.stringify({ data, updatedAt }));
    return { updatedAt };
  } catch {
    throw new Error('Failed to save workspace data.');
  }
}

export async function apiPullUserSync(token: string): Promise<{ exists: boolean; data: any; updatedAt?: string }> {
  try {
    const raw = localStorage.getItem('oc_user_cloud_sync_data');
    if (!raw) {
      return { exists: false, data: null };
    }
    const parsed = JSON.parse(raw);
    return { exists: true, data: parsed.data, updatedAt: parsed.updatedAt };
  } catch {
    return { exists: false, data: null };
  }
}
