import { AuthProvider, ToastProvider } from '@kadai/ui';
import { RouterProvider } from 'react-router-dom';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { auth } from '@/lib/auth';
import { router } from '@/routes/router';

export function App() {
  return (
    <AuthProvider auth={auth}>
      <WorkspaceProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
