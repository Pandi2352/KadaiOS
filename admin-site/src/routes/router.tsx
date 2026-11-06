import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MODULES } from '@/config/modules';
import { ModulePage } from '@/pages/ModulePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      ...Object.values(MODULES).map((module) => ({
        path: module.path,
        element: <ModulePage module={module} />,
      })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
