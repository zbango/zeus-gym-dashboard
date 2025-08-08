export const rootPaths = {
  root: '/',
  dashboardRoot: 'dashboard',
  pagesRoot: 'pages',
  miscRoot: 'misc',
  authRoot: 'authentication',
  pricingRoot: 'pricing',
  authDefaultJwtRoot: 'default/jwt',
  authDefaultFirebaseRoot: 'default/firebase',
  authDefaultAuth0Root: 'default/auth0',
  errorRoot: 'error',
  ecommerceRoot: 'ecommerce',
  ecommerceAdminRoot: 'admin',
  ecommerceCustomerRoot: 'customer',
  eventsRoot: 'events',
  emailRoot: 'email',
  kanbanRoot: 'kanban',
  appsRoot: 'apps',
};

const paths = {
  starter: `/${rootPaths.pagesRoot}/starter`,

  defaultJwtLogin: `/${rootPaths.authRoot}/login`,
  defaultJwtForgotPassword: `/${rootPaths.authRoot}/forgot-password`,
  defaultJwtSetPassword: `/${rootPaths.authRoot}/set-password`,

  defaultLoggedOut: `/${rootPaths.authRoot}/default/logged-out`,
  pricingColumn: `/${rootPaths.pricingRoot}/column`,
  notifications: `/${rootPaths.pagesRoot}/notifications`, //? update path

  404: `/${rootPaths.errorRoot}/404`,
};

export const authPaths = {
  /* ---------------------------------JWT----------------------------------------- */
  login: paths.defaultJwtLogin,
  forgotPassword: paths.defaultJwtForgotPassword,
  setNewPassword: paths.defaultJwtSetPassword,
};

export const apiEndpoints = {
  register: '/auth/register',
  login: '/auth/login',
  logout: '/auth/logout',
  profile: '/auth/profile',
  getUsers: '/users',
  forgotPassword: '/auth/forgot-password',
  setPassword: '/auth/set-password',
  getProduct: (id: string) => `e-commerce/products/${id}`,
};

export default paths;
