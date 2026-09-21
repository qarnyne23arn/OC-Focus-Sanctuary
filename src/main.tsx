// Safely intercept and handle window.fetch property assignment attempts to prevent getter-only TypeError
if (typeof window !== 'undefined') {
  try {
    let originalFetch = window.fetch;
    const proto = window.Window ? window.Window.prototype : Window.prototype;
    if (proto) {
      try {
        Object.defineProperty(proto, 'fetch', {
          get() { return originalFetch; },
          set(v) { if (typeof v === 'function') originalFetch = v; },
          configurable: true,
          enumerable: true
        });
      } catch (err) {}
    }
    Object.defineProperty(window, 'fetch', {
      get() { return originalFetch; },
      set(v) { if (typeof v === 'function') originalFetch = v; },
      configurable: true,
      enumerable: true
    });
  } catch (e) {}

  window.addEventListener('error', (event) => {
    const msg = event.message || event.error?.message || '';
    if ((msg.includes('fetch') && msg.includes('getter')) || msg.includes('Cannot set property fetch')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if ((reason.includes('fetch') && reason.includes('getter')) || reason.includes('Cannot set property fetch')) {
      event.preventDefault();
    }
  }, true);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
