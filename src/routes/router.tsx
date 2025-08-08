import { Suspense, lazy } from 'react';
import { Outlet, RouteObject, createBrowserRouter, useLocation } from 'react-router';
import App from 'App';
import AuthLayout from 'layouts/auth-layout';
import DefaultAuthLayout from 'layouts/auth-layout/DefaultAuthLayout';
import MainLayout from 'layouts/main-layout';
import Page404 from 'pages/errors/Page404';
import GuestGuard from 'components/guard/GuestGuard';
import RequireAuth from 'components/guard/RequireAuth';
import PageLoader from 'components/loading/PageLoader';
import paths, { rootPaths } from './paths';

// import Splash from 'components/loading/Splash';

const Starter = lazy(() => import('pages/others/Starter'));

const LoggedOut = lazy(() => import('pages/authentication/default/LoggedOut'));

const Login = lazy(() => import('pages/authentication/default/jwt/Login'));
const ForgotPassword = lazy(() => import('pages/authentication/default/jwt/ForgotPassword'));
const SetPassword = lazy(() => import('pages/authentication/default/jwt/SetPassword'));

export const SuspenseOutlet = () => {
  const location = useLocation();

  return (
    <Suspense key={location.pathname} fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

export const routes: RouteObject[] = [
  {
    element: (
      // Uncomment the following line to enable the Suspense fallback for initial loading when using AuthGuard

      // <Suspense fallback={<Splash />}>
      <App />
      // </Suspense>
    ),
    children: [
      {
        path: '/',
        element: (
          <RequireAuth>
            <MainLayout>
              <SuspenseOutlet />
            </MainLayout>
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <Starter />,
          },

          {
            path: '',
            element: <Page404 />,
          },
        ],
      },

      {
        path: rootPaths.authRoot,
        element: (
          <GuestGuard>
            <AuthLayout />
          </GuestGuard>
        ),
        children: [
          {
            element: (
              <DefaultAuthLayout>
                <SuspenseOutlet />
              </DefaultAuthLayout>
            ),
            children: [
              {
                path: paths.defaultJwtLogin,
                element: <Login />,
              },
              {
                path: paths.defaultJwtForgotPassword,
                element: <ForgotPassword />,
              },
              {
                path: paths.defaultJwtSetPassword,
                element: <SetPassword />,
              },
              {
                path: paths.defaultLoggedOut,
                element: <LoggedOut />,
              },
            ],
          },
        ],
      },

      {
        path: '*',
        element: <Page404 />,
      },
    ],
  },
];

const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_BASENAME || '/',
});

export default router;
