/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE_URL = 'oc_supabase_url_v1';
const STORAGE_KEY_SUPABASE_KEY = 'oc_supabase_key_v1';

const DEFAULT_SUPABASE_URL = 'https://snbszwbhesgvgzqermsk.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuYnN6d2JoZXNndmd6cWVybXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNDUxNjcsImV4cCI6MjEwNTcyMTE2N30.e2Bpuf_cOyIqpPAiuQGc0s6c5RXRtsSoN1xnaf9QDf4';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  try {
    const url = localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const anonKey = localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
    return { url, anonKey };
  } catch {
    return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_KEY };
  }
}

export function saveStoredSupabaseConfig(url: string, anonKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, anonKey.trim());
  } catch (err) {
    console.warn('Failed to save Supabase config', err);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }
  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(url, anonKey);
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}
