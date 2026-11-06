import { RouterProvider } from 'react-router-dom';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { router } from '@/routes/router';

export function App() {
  return (
    <WorkspaceProvider>
      <RouterProvider router={router} />
    </WorkspaceProvider>
  );
}
