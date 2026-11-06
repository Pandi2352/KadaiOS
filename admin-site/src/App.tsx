import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from '@/context/ToastContext';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { router } from '@/routes/router';

export function App() {
  return (
    <WorkspaceProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </WorkspaceProvider>
  );
}
