import { UserProfile } from '../types';
import { auth } from './firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

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
    auth.signOut();
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

export async function apiChangePassword(token: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated Firebase user found.');
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { success: true, message: 'Password updated successfully.' };
  } catch (err: any) {
    throw new Error(err.message || 'Failed to update password.');
  }
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
