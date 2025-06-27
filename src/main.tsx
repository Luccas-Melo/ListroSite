import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster
      richColors
      position="top-right"
      expand={true}
      closeButton={true}
      duration={3400}
      visibleToasts={4}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: 'transition-all duration-500 ease-in-out will-change-transform',
        },
      }}
      hotkey={['Delete']}
    />
    <App />
  </StrictMode>
);
