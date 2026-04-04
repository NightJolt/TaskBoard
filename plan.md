# TaskBoard — Implementation Plan

## Overview
Task management platform. Admin invites users via invite codes. Users create projects, manage tasks, assign them to project members. Real-time updates via WebSockets.

## Tech Stack
| Layer | Technology |
|---|---|
| Backend | NestJS 11 (modular monolith) |
| Frontend | Angular 19 + Angular Material |
| Database | MongoDB (Mongoose) |
| Cache | Redis |
| Search | Elasticsearch |
| Message Broker | RabbitMQ |
| Real-time | WebSockets (Socket.io / NestJS Gateway) |
| Auth | JWT (access token, refresh deferred) |

## Backend Patterns
- Controllers split by access level: `*-public`, `*-authed`, `*-admin` (same route prefix)
- Services split the same way, plus `*-system` for shared logic
- `@Authenticated()` decorator: no decorator = public, empty = any authed, with role = role-specific
- `RolesGuardian` — combined JWT + role guard, applied per-controller (not global)
- Config via `@nestjs/config` + Joi validation in AppModule
- Schema types: `UserDocument` + `UserModel` declared after class, use `import type` for models in DI
- Request DTOs: `{module}.requests.ts` with `*Req` suffix, all in one file
- Response DTOs: `{module}.responses.ts` with `*Res` suffix, whitelist via `@Exclude()`/`@Expose()`
- Services receive full `UserDocument`, use `user.id` not `user._id.toString()`
- `.env` committed directly (demo project)

## Backend Modules

### 1. Auth ✅
- JWT access token (refresh + logout deferred until Redis)
- Login, register (with invite code)
- Admin generates/lists invite codes
- `@Authenticated` decorator + `RolesGuardian` guard
- Split: 3 controllers (public, authed, admin) + 3 services (system, public, admin)

### 2. Users ✅
- User schema: email, password (bcrypt pre-save hook), name, role (admin/user)
- Invite code schema: code, createdBy, usedBy, expiresAt, isUsed
- Admin seeded from env vars on first boot

### 3. Projects
- Project schema: name, description, owner, members[]
- CRUD operations
- Member management (add/remove members)
- Only members can access project resources

### 4. Tasks
- Task schema: title, status (Todo/InProgress/Done), deadline, priority (Low/Medium/High), assignee, project, createdBy
- CRUD within a project context
- Assign/reassign to project members
- Status transitions

### 5. Search
- Elasticsearch index for tasks
- Full-text search by title
- Filter by status, priority, assignee, project
- Sync from MongoDB via RabbitMQ events

### 6. Notifications
- Consumes RabbitMQ events (task.assigned, task.updated, member.added)
- Stores in-app notifications
- Pushes to connected clients via WebSockets

### 7. Gateway (WebSockets)
- NestJS Gateway with Socket.io
- Real-time events: task created/updated/deleted, notifications
- Room-based: users subscribe to project rooms

### 8. Redis (deferred)
- JWT token blacklisting (logout)
- Refresh token rotation
- Caching, rate limiting

## Frontend Structure

### Core
- Auth service, HTTP interceptor (JWT injection), auth guard, WebSocket service

### Features
- **Auth** — Login & register (with invite code) pages
- **Dashboard** — Overview of user's projects
- **Projects** — Project list, create project, project detail with member management
- **Tasks** — Kanban board (drag-drop between Todo/InProgress/Done), task create/edit dialog, search bar (Elasticsearch-powered)
- **Admin** — Invite code generation, user list

### UI
- Angular Material components
- Kanban board with CDK drag-drop

## Deployment
Entire stack ships with Docker.

- `docker-compose.yml` at project root — single `docker-compose up` runs everything
- `backend/Dockerfile` — NestJS app container
- `frontend/Dockerfile` — Angular app (build + nginx serve)
- Service containers: MongoDB, Redis, Elasticsearch, RabbitMQ

## Build Order
1. ~~Docker Compose + Config + Auth + Users~~ ✅
2. Backend: projects → tasks → search → notifications → gateway → redis
3. Frontend: core/auth → projects → tasks/kanban → search → real-time → admin
4. Dockerfiles for backend & frontend
5. Integration testing & polish
