import { AuthProvider, ToastProvider } from '@kadai/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { auth } from '@/lib/auth';
import { router } from '@/routes/router';
import '@/styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider auth={auth}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);
