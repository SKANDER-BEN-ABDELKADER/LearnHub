// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './components/context/AuthContext';
// Temporary: suppress noisy extension/service-worker message about async responses
// This is a mitigation only — the real fix is to update the offending extension
// listener (see notes in console or extension background script). We prevent
// the unhandledrejection from being reported for that specific message so it
// doesn't clutter devtools while you work.
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event && event.reason;
      const message = reason && (reason.message || String(reason));
      if (typeof message === 'string' && message.includes('A listener indicated an asynchronous response by returning true')) {
        // suppress reporting for this known extension/service-worker issue
        event.preventDefault();
        // keep a debug log so you can notice it if needed
        // console.debug('Suppressed extension async-response error:', reason);
      }
    } catch (err) {
      // swallow any errors from our handler — we don't want to break app startup
      console.error('Error in unhandledrejection handler:', err);
    }
  });
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

