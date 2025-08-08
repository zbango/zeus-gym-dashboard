## Zeus Gym — Admin Dashboard (React 19, Vite 7, MUI 7)

Modern, themeable admin dashboard for a gym. Built with React 19 + TypeScript, Vite, Material UI (v7), SWR, Axios, i18next, Notistack, Day.js, Lottie, and React Router v7. Includes multiple navigation layouts, light/dark modes, RTL, and pluggable auth flows (JWT/Firebase skeletons).

### Quick start

```bash
git clone <repo-url>
cd zeus-gym
npm i
npm run dev
```

Open http://localhost:5001 (default via `VITE_APP_PORT`).

### Requirements

- Node 18+
- npm 9+ (repo ships with `package-lock.json`)

### Scripts

- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npm run preview`: preview production build
- `npm run lint`: ESLint (flat config) with type-check overlay
- `npm run pretty`: Prettier (with import sort plugin)

### Environment

Create `.env` (or `.env.local`) in project root:

```env
VITE_APP_PORT=5001
VITE_BASENAME=/
VITE_API_URL=http://localhost:8000/api
# Only if you use Supabase. If not using, you can ignore these and the module is unused.
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- Base path is controlled by `VITE_BASENAME` (wired in `vite.config.ts` and router basename).
- API base URL is `VITE_API_URL` (used by Axios instance).
- Supabase client will throw if imported without keys; it’s present but not referenced by default.

### Tech stack

- React 19 + TypeScript
- Vite 7, `@vitejs/plugin-react`, `vite-tsconfig-paths`, `vite-plugin-checker`
- Material UI 7 (core, lab, x-data-grid, date/time pickers)
- SWR 2 for data fetching/mutations
- Axios 1 with auth interceptor
- i18next with browser language detector + 6 locales
- Notistack snackbars
- Day.js, Lottie, Simplebar
- React Router 7 with lazy routes and per-route Suspense

### Features

- Multiple layouts: sidenav, topnav, combo (switchable)
- Theming: light/dark, RTL, locale-aware MUI theme
- Navigation color modes including "vibrant"
- Auth pages for JWT and Firebase (JWT wired to API, Firebase demo-only)
- Settings panel to toggle layout/nav/theme at runtime
- Data grid, date/time pickers, and a rich MUI component theme
- i18n with `en-US`, `fr-FR`, `bn-BD`, `zh-CN`, `hi-IN`, `ar-SA`

### Project structure (high level)

```
src/
  assets/                # images, lottie, audio, pdf
  components/            # UI components (common, sections, icons, etc.)
  hooks/                 # custom hooks (theme mode, icons, etc.)
  layouts/               # main/auth layouts (sidenav/topnav/combo variants)
  locales/               # i18n setup and translations
  pages/                 # route pages (auth, errors, starter)
  providers/             # app-level providers (Theme, Settings, SWR, Auth, etc.)
  routes/                # router config and path helpers
  services/              # axios, SWR config, API hooks
  theme/                 # MUI theme, palette, component overrides
  lib/                   # utilities, constants, supabase client
  data/                  # demo data
```

### Routing

- Router entry: `src/routes/router.tsx`
- Base path: `VITE_BASENAME` (defaults to `/`)
- Routes are lazy-loaded with `<Suspense>` per location

Key routes (see `src/routes/paths.ts`):

- `/` → `Starter` page
- `/authentication/default/jwt/*` → JWT: login, sign-up, forgot-password, 2FA, set-password
- `/authentication/default/firebase/*` → Firebase demo forms
- `*` → 404 page

To change layout globally, switch the default export in `src/layouts/main-layout/index.tsx` to `SidenavLayout`, `TopnavLayout`, or `ComboLayout`.

### Auth (Supabase)

- Provider wrapper: `src/providers/AuthProvider.tsx` (uses `AuthSupabaseProvider`)
- Supabase provider: `src/providers/auth-provider/AuthSupabaseProvider.tsx`
- Supabase client: `src/lib/supabaseClient.ts`
- Guards:
  - Require auth: `src/components/guard/RequireAuth.tsx`
  - Guest-only: `src/components/guard/GuestGuard.tsx`

Environment required:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Provider API (via `useSupabaseAuth()`):

```ts
const { user, session, isInitializing, signInWithPassword, signUpWithPassword, signOut } = useSupabaseAuth();
```

Routing usage:

```tsx
// Protect app area
{
  path: '/',
  element: (
    <RequireAuth>
      <MainLayout>
        <SuspenseOutlet />
      </MainLayout>
    </RequireAuth>
  ),
}

// Make entire auth subtree guest-only
{
  path: rootPaths.authRoot,
  element: (
    <GuestGuard>
      <AuthLayout />
    </GuestGuard>
  ),
  children: [/* login/forgot/set-password... */],
}
```

Login page example (`src/pages/authentication/default/jwt/Login.tsx`):

```ts
const { signInWithPassword } = useSupabaseAuth();
await signInWithPassword({ email, password });
```

Notes:
- Supabase SDK persists session and handles token refresh; the provider reflects that session into React state and guards.
- If you still need legacy JWT API endpoints, see `src/services/swr/api-hooks/useAuthApi.ts` and `routes/paths.ts`.

### Theming, settings, RTL, i18n

- Theme factory: `src/theme/theme.ts` (light/dark palettes, component overrides, typography, shadows)
- Settings state: `src/providers/SettingsProvider.tsx` with `initialConfig` in `src/config.ts`
- Theme provider: `src/providers/ThemeProvider.tsx` (uses direction + locale to build MUI theme)
- Settings Panel: `components/settings-panel/*` with `SettingPanelToggler` mounted in `App.tsx`
- RTL wrapper: `src/theme/RTLMode.tsx`
- i18n: `src/locales/i18n.ts` with resources for 6 locales; `SettingsProvider` updates i18n when `config.locale` changes

Persisted config values (localStorage keys): `sidenavCollapsed`, `sidenavType`, `topnavType`, `textDirection`, `navigationMenuType`, `navColor`, `locale`.

### Data fetching (SWR + Axios)

- Global SWR config in `src/services/configuration/SWRConfiguration.tsx`
- Fetcher: `src/services/axios/axiosFetcher.ts` supporting tuple keys, methods, and optional flags:
  - `disableThrowError` to swallow errors and return `null`
  - `disableErrorToast` hook point (no-op by default)
- Example hooks in `src/services/swr/api-hooks/useAuthApi.ts`

### Deployment

- Build: `npm run build` → `dist/`
- Preview locally: `npm run preview`
- If hosting under a subpath, set `VITE_BASENAME` before build (also used as router basename).

### Known notes

- Supabase client (`src/lib/supabaseClient.ts`) throws if imported without keys. It’s not referenced by default; if you intend to use it, add the env vars.
- Firebase auth pages are UI-only placeholders; wire them to your backend/SDK if needed.