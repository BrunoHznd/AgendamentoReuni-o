import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { NotificationService } from './services/notifications';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado com sucesso:', registration);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('StackBlitz') || errorMessage.includes('not yet supported')) {
        console.warn('Service Workers não são suportados no StackBlitz - funcionalidades PWA limitadas');
      } else {
        console.error('Erro ao registrar Service Worker:', error);
      }
    }
  });
}

// Handle install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install notification after 30 seconds
  setTimeout(() => {
    NotificationService.showInstallPrompt();
  }, 30000);
});

// Handle app installed
window.addEventListener('appinstalled', () => {
  console.log('PWA foi instalado');
  deferredPrompt = null;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
