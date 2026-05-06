import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './lib/firebase'; // initialize Firebase + emulator
import Landing from './pages/Landing';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import { RequireAuth } from './pages/admin/RequireAuth';
import { Tutorial } from './components/Tutorial';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } });

const router = createBrowserRouter([
  { path: '/', element: <Landing />, errorElement: <ServerError /> },
  { path: '/quiz', element: <Quiz />, errorElement: <ServerError /> },
  { path: '/result', element: <Result />, errorElement: <ServerError /> },
  { path: '/admin/login', element: <Login />, errorElement: <ServerError /> },
  { path: '/admin', element: <RequireAuth><Dashboard /></RequireAuth>, errorElement: <ServerError /> },
  { path: '*', element: <NotFound /> },
]);

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
      <Tutorial />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: '2px solid #15151b',
            borderRadius: '14px',
            boxShadow: '0 4px 0 0 rgba(21,21,27,1)',
            background: '#fff',
            color: '#15151b',
            fontWeight: 600,
          },
        }}
      />
    </QueryClientProvider>
  );
}
