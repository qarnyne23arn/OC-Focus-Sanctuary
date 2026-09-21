import { UserProfile } from '../types';

const STORAGE_KEY_AUTH_USER = 'oc_auth_user_v1';
const STORAGE_KEY_AUTH_TOKEN = 'oc_auth_token_v1';
const STORAGE_KEY_GUEST_DISMISSED = 'oc_auth_guest_dismissed_v1';

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

// API Calls
export async function apiSignUp(email: string, password: string, name?: string): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to sign up.');
  }

  return { user: json.user, token: json.token };
}

export async function apiLogIn(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Invalid credentials.');
  }

  return { user: json.user, token: json.token };
}

export async function apiChangePassword(token: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to change password.');
  }

  return { success: true, message: json.message || 'Password changed successfully.' };
}

export async function apiPushUserSync(token: string, data: any): Promise<{ updatedAt: string }> {
  const res = await fetch('/api/auth/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to push workspace data.');
  }

  return { updatedAt: json.updatedAt };
}

export async function apiPullUserSync(token: string): Promise<{ exists: boolean; data: any; updatedAt?: string }> {
  const res = await fetch('/api/auth/sync', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to pull workspace data.');
  }

  return {
    exists: json.exists ?? false,
    data: json.data,
    updatedAt: json.updatedAt,
  };
}
