# TaskBoard Frontend

## Architecture
Angular 19 with standalone components (no NgModules).

## Structure
```
src/app/
├── core/              # Auth service, guards, interceptors, API client
├── shared/            # Reusable components, pipes, directives
├── features/
│   ├── auth/          # Login page
│   ├── dashboard/     # Project overview
│   ├── projects/      # Project list, detail, member management
│   └── tasks/         # Task board, task detail, search
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

## Key Patterns
- Standalone components (Angular 19 default)
- Lazy-loaded feature routes
- Services + Angular signals for state
- HTTP interceptors for auth token injection

## Decisions
- UI library: Angular Material
- State management: Services + Angular signals
- Task board: Kanban (drag-and-drop columns: Todo / In Progress / Done)
- Real-time: WebSockets via Socket.io for live updates
