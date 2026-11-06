import { AuthProvider, IconDefaults, SessionEndedNotice, ToastProvider } from '@kadai/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { auth } from '@/lib/auth';
import { router } from '@/routes/router';
import '@/styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IconDefaults>
      <AuthProvider auth={auth}>
        <ToastProvider>
          <SessionEndedNotice />
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </IconDefaults>
  </StrictMode>,
);
