import { createBrowserRouter } from 'react-router-dom';
import { PageMessage } from '@/components/PageMessage';
import { SiteLayout } from '@/components/SiteLayout';
import { PATHS } from '@/config/paths';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    errorElement: <PageMessage title="Something went wrong" message="Reload this page to try again." />,
    children: [
      { path: PATHS.home, element: <HomePage /> },
      { path: PATHS.login, element: <LoginPage /> },
      { path: PATHS.register, element: <RegisterPage /> },
      {
        path: '*',
        element: <PageMessage title="Page not found" message="This address doesn't match any page on this site." />,
      },
    ],
  },
]);
