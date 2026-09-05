import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
  } catch (err) {
    console.error('Fatal initialization error in KODI root:', err);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background-color: #0c0d14; color: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="width: 64px; height: 64px; border-radius: 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 28px;">
          ⚠️
        </div>
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">KODI AI - Inicializando</h2>
        <p style="font-size: 14px; color: #a1a1aa; max-width: 380px; margin-bottom: 24px; line-height: 1.5;">
          El sistema está restableciendo el entorno seguro de la aplicación.
        </p>
        <button onclick="window.location.reload(true)" style="padding: 12px 24px; border-radius: 12px; background: #f59e0b; color: #000000; font-weight: 700; font-size: 14px; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
          Reiniciar KODI
        </button>
      </div>
    `;
  }
}

