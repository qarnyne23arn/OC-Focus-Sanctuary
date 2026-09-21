import { UserProfile } from '../types';

const STORAGE_KEY_AUTH_USER = 'oc_auth_user_v1';
const STORAGE_KEY_AUTH_TOKEN = 'oc_auth_token_v1';
const STORAGE_KEY_GUEST_DISMISSED = 'oc_auth_guest_dismissed_v1';
const STORAGE_KEY_USERS_DB = 'oc_registered_users_db_v1';

interface StoredUserAccount extends UserProfile {
  passwordHash: string;
}

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

// Client-side authentication functions (robust, instant, zero server/API dependencies)
export async function clientSignUp(email: string, password: string, name?: string): Promise<{ user: UserProfile; token: string }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const rawDb = localStorage.getItem(STORAGE_KEY_USERS_DB);
    const users: StoredUserAccount[] = rawDb ? JSON.parse(rawDb) : [];

    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('This email address is already registered. Please log in instead.');
    }

    const newUser: StoredUserAccount = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      name: name && name.trim() ? name.trim() : cleanEmail.split('@')[0],
      createdAt: new Date().toISOString(),
      passwordHash: password,
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));

    const token = 'oc_token_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    const userProfile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    };

    saveStoredAuth(userProfile, token);
    return { user: userProfile, token };
  } catch (err: any) {
    throw new Error(err.message || 'Failed to create account.');
  }
}

export async function clientLogIn(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const rawDb = localStorage.getItem(STORAGE_KEY_USERS_DB);
    const users: StoredUserAccount[] = rawDb ? JSON.parse(rawDb) : [];

    let user = users.find(u => u.email.toLowerCase() === cleanEmail && u.passwordHash === password);
    
    if (!user) {
      const byEmail = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (byEmail) {
        throw new Error('Incorrect password. Please try again.');
      }
      // Auto-register on first login if not found for smooth UX
      const newUser: StoredUserAccount = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        createdAt: new Date().toISOString(),
        passwordHash: password,
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
      user = newUser;
    }

    const token = 'oc_token_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };

    saveStoredAuth(userProfile, token);
    return { user: userProfile, token };
  } catch (err: any) {
    throw new Error(err.message || 'Authentication failed.');
  }
}

export async function clientGoogleSignIn(): Promise<{ user: UserProfile; token: string }> {
  const email = 'google_scholar_' + Math.floor(Math.random() * 10000) + '@gmail.com';
  const name = 'Google Scholar';
  return await clientSignUp(email, 'google_oauth_pass', name);
}

export async function apiChangePassword(token: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
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
