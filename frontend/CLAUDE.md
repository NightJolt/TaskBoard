# TaskBoard Frontend

## Architecture
Angular 19 with standalone components (no NgModules).

## Tech
- **Angular Material** — UI components with custom theme
- **Signals** — state management in services
- **Reactive Forms** — form handling with validation
- **Lazy-loaded routes** — each feature is a separate chunk

## Patterns

### Dependency injection
Use `inject()` function instead of constructor injection — required when using DI in field initializers (e.g. `form = this.fb.group(...)`).

### Auth
- JWT stored in localStorage
- `authInterceptor` (functional) attaches Bearer token to all requests
- `authGuard` — redirects to `/login` if not authenticated
- `guestGuard` — redirects to `/` if already authenticated (prevents logged-in users from seeing login/register)
- `AuthService` uses signals: `token()`, `user()`, `isAuthenticated()`

### Components
- Standalone components with inline template + styles
- Angular Material for all UI elements
- `MatSnackBar` for error feedback

## Structure
```
src/app/
├── core/
│   ├── environment.ts        # API URL config
│   ├── auth.service.ts       # Login, register, token management (signals)
│   ├── auth.interceptor.ts   # Functional HTTP interceptor (JWT)
│   └── auth.guard.ts         # authGuard + guestGuard (functional)
├── features/
│   ├── auth/
│   │   ├── login.component.ts
│   │   └── register.component.ts
│   ├── dashboard/
│   │   └── dashboard.component.ts  # Placeholder
│   ├── projects/              # TBD
│   └── tasks/                 # TBD
├── app.component.ts           # Just <router-outlet />
├── app.config.ts              # Providers: router, httpClient, animations
└── app.routes.ts              # Lazy-loaded routes with guards
```

## Backend Connection
- API URL: `http://localhost:3000/api` (configured in `core/environment.ts`)
- Backend must have CORS enabled (`app.enableCors()` in main.ts)
- Frontend dev server: `http://localhost:4200`

## Decisions
- UI library: Angular Material
- State management: Services + Angular signals
- Task board: Kanban (drag-and-drop columns: Todo / In Progress / Done)
- Real-time: WebSockets via Socket.io for live updates (TBD)
