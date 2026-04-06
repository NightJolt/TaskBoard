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
- Controllers split by access level: `*-public`, `*-authed`, `*-member`, `*-owner`, `*-admin`
- Services split the same way, plus `*-system` for shared logic
- `@Authenticated()` decorator: no decorator = public, empty = any authed, with role = role-specific
- `@ProjectMembership()` decorator: verifies project membership, loads project onto request
- `RolesGuardian` — combined JWT + role guard, applied per-controller (not global)
- `@Authenticated` must be closest to `@Controller` (bottom decorator) — auth runs before other guards
- All decorators class-level only, never on methods
- Never use `any` — always proper TypeScript types
- Schema types: `*Document` + `*Model` declared after class, use `import type` for models in DI
- Request DTOs in `dto/*.requests.ts` with `*Req` suffix
- Response DTOs in `dto/*.responses.ts` with `*Res` suffix, whitelist via `@Exclude()`/`@Expose()`
- Services receive full documents, use `.id` not `._id.toString()`
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

### 3. Projects ✅
- Project schema: name, description, owner (ref User)
- ProjectMember schema (separate collection): project, user, role (owner/member). Compound unique index.
- `@ProjectMembership()` guard + `@CurrentProject()` decorator
- 3 controllers: authed (create, list), member (get, update), owner (delete, add/remove members)
- CRUD + member management, membership-gated access

### 4. Tasks ✅
- Task schema: title, status (todo/in_progress/done), deadline, priority (low/medium/high), assignee (ref User), project (ref Project), createdBy (ref User)
- All endpoints under `/api/projects/:id/tasks`, require `@ProjectMembership()`
- CRUD + assignee validation (must be project member)
- Single controller (tasks-member) — all members can create/edit/delete tasks

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

### 8. Redis ✅ (partial)
- JWT token blacklisting (logout) ✅
- Global RedisModule with ioredis
- TokenBlacklistService + JTI in JWT payload
- Refresh token rotation (TBD)
- Caching, rate limiting (TBD)

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
2. ~~Projects~~ ✅
3. ~~Tasks~~ ✅
4. ~~Redis (JWT blacklisting / logout)~~ ✅
5. ~~Frontend: auth, dashboard, kanban, task CRUD, member mgmt, admin panel~~ ✅
6. Backend: RabbitMQ → Elasticsearch → WebSockets
7. Dockerfiles for backend & frontend
8. Integration testing & polish
