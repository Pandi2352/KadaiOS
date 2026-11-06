import { RequireAuth } from '@kadai/ui';
import type { ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MODULES } from '@/config/modules';
import { SITE } from '@/config/site';
import { BusinessSetupPage } from '@/pages/BusinessSetupPage';
import { LoginPage } from '@/pages/LoginPage';
import { ModulePage } from '@/pages/ModulePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';
import type { ModuleId } from '@/types/navigation';

/** Modules with a real screen. Every other module shows the shared "not built yet" page. */
const BUILT_PAGES: Partial<Record<ModuleId, ReactNode>> = {
  setup: <BusinessSetupPage />,
};

export const router = createBrowserRouter([
  { path: SITE.loginPath, element: <LoginPage />, errorElement: <RouteErrorPage /> },
  {
    // Everything in the admin app sits behind this, including the not-found page.
    element: (
      <RequireAuth loginPath={SITE.loginPath}>
        <AppLayout />
      </RequireAuth>
    ),
    // The outer error page catches a crash in the layout. The inner one keeps the sidebar when a page crashes.
    errorElement: <RouteErrorPage />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          ...Object.values(MODULES).map((module) => ({
            path: module.path,
            element: BUILT_PAGES[module.id] ?? <ModulePage module={module} />,
          })),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
