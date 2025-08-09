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
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
# Optional default tenant bootstrap in client
VITE_DEFAULT_GYM_ID=00000000-0000-0000-0000-000000000000
```

- Base path is controlled by `VITE_BASENAME` (wired in `vite.config.ts` and router basename).
- API base URL is `VITE_API_URL` (used by Axios instance).
- Supabase client will throw if missing keys.

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
const { user, session, isInitializing, signInWithPassword, signUpWithPassword, signOut } =
  useSupabaseAuth();
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

### Multi-tenant and RLS model

- `public.user_profiles`: anchors `auth.users.id → gym_id, role` for Row Level Security checks
- All domain tables include `gym_id` and use policies that check membership via `user_profiles`
- On login the client ensures a profile row exists and loads it into context:
  - Client code: `AuthSupabaseProvider.ensureAndLoadProfile()`
  - Env: `VITE_DEFAULT_GYM_ID` used only as a bootstrap fallback

SQL starter (see `src/db/initial_db_schema.sql`): tables `customers`, `plans`, `memberships`, `payments`, `attendance`, `staff`, plus `progress_events` for customer progress history. RLS is enabled on all domain tables.

### Users module (Staff CRUD)

- Page: `src/pages/users/Users.tsx`
- Sections:
  - `src/components/sections/users/UsersListContainer.tsx`
  - `src/components/sections/users/UsersTable.tsx` (SWR-backed)
  - `src/components/sections/users/CreateUserDialog.tsx`
- Data hook: `src/hooks/useStaffList.ts` (SWR key `staff:list`)

Create staff flow (admin-only):

- Edge Function: `supabase/functions/admin-create-user-and-provision/index.ts`
  - Creates or updates the Auth user by email and optional password
  - Upserts `public.user_profiles` and inserts `public.staff` (unique on `(gym_id,user_id)`)
- UI Dialog posts to the function and then `mutate('staff:list')` to refresh the table without a full reload

Supabase setup for the function:

1. Deploy edge function
   - `supabase functions deploy admin-create-user-and-provision`
2. Set function env vars
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Ensure DB constraints/policies
   - `alter table public.staff add constraint uq_staff_gym_user unique (gym_id, user_id);`
   - Enable RLS and self policies on `public.user_profiles` (see SQL file)

### Customers module

- Page: `src/pages/customers/Customers.tsx`
- Sections mirror Users module and use MUI DataGrid
- Optional progress tracking via `public.progress_events` (flexible JSON metrics + photo path), see SQL file

### SWR data layer

- Global config: `src/services/configuration/SWRConfiguration.tsx`
- Example staff list hook: `src/hooks/useStaffList.ts`
- Pattern: optimistic update via `mutate(key, updater, { revalidate: false })`, or fire-and-revalidate

### Edge Functions (Supabase)

- `admin-create-user-and-provision`: service-role function to create Auth user + provision domain rows.
- CORS: function replies with permissive CORS headers; client includes `Authorization: Bearer VITE_SUPABASE_ANON_KEY`.

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
