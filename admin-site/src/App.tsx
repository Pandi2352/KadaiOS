import { AuthProvider, IconDefaults, SessionEndedNotice, ToastProvider } from '@kadai/ui';
import { RouterProvider } from 'react-router-dom';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { auth } from '@/lib/auth';
import { router } from '@/routes/router';

export function App() {
  return (
    <IconDefaults>
      <AuthProvider auth={auth}>
        <WorkspaceProvider>
          <ToastProvider>
            <SessionEndedNotice />
            <RouterProvider router={router} />
          </ToastProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </IconDefaults>
  );
}
