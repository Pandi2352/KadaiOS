import { createBrowserRouter } from 'react-router-dom';
import { PageMessage } from '@/components/PageMessage';
import { HomePage } from '@/pages/HomePage';

export const router = createBrowserRouter([
  {
    errorElement: <PageMessage title="Something went wrong" message="Reload this page to try again." />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '*',
        element: <PageMessage title="Page not found" message="This address doesn't match any page on this site." />,
      },
    ],
  },
]);
