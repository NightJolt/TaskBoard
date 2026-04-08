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
- Always use separate `.html` and `.css` files — never inline templates or styles
- Share common styles via shared stylesheet (e.g. `auth.styles.css`)
- Angular Material for all UI elements
- `MatSnackBar` for error feedback
- All reactive state must use signals (never boolean properties for `loading`, `hidePassword`, etc.)
- Services must be private — expose typed computed properties or methods to templates, never raw service access
- Never use `::ng-deep` — it's deprecated
- Dialog label clipping fix is global in `styles.css` (`.mat-mdc-dialog-content` overflow/padding)
- Datepickers: use standard Material datepicker, keep it simple — no `touchUi`, no custom wrappers
- Priority colors: red = high, orange = medium, green = low

## Structure
```
src/app/
├── core/
│   ├── environment.ts        # API URL config
│   ├── auth.service.ts       # Login, register, token + user in localStorage
│   ├── auth.interceptor.ts   # Functional HTTP interceptor (JWT)
│   ├── auth.guard.ts         # authGuard + adminGuard + guestGuard (functional)
│   ├── admin.service.ts      # Invite codes + user list (admin only)
│   ├── projects.service.ts   # Project CRUD + member management
│   ├── tasks.service.ts      # Task CRUD
│   └── socket.service.ts     # Socket.io client, project rooms, task event subjects
├── features/
│   ├── auth/
│   │   ├── auth.styles.css          # Shared auth styles
│   │   ├── login.component.*
│   │   └── register.component.*
│   ├── dashboard/
│   │   └── dashboard.component.*    # Project list with owner badges
│   ├── projects/
│   │   ├── project-detail.component.*  # Kanban + sidebar layout
│   │   ├── create-project.dialog.*     # Create project dialog
│   │   ├── edit-project.dialog.*       # Edit project dialog
│   │   ├── add-member.dialog.*         # Add member dialog
│   │   └── task.dialog.*               # Create/edit task dialog
│   ├── admin/
│   │   └── admin.component.*           # Invite codes + user list (tabs)
│   └── tasks/                          # TBD
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
- Real-time: Socket.io client receives granular task events (created/updated/deleted), updates local signals directly — no refetching
