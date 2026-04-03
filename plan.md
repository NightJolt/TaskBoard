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
| Auth | JWT (access + refresh tokens) |

## Backend Modules

### 1. Config
- Centralized env configuration with validation (`@nestjs/config` + Joi)
- Connection configs for MongoDB, Redis, Elasticsearch, RabbitMQ

### 2. Auth
- JWT-based auth (access + refresh tokens)
- Login, register (with invite code), logout
- Token blacklisting via Redis
- Guards: `JwtAuthGuard`, `RolesGuard`

### 3. Users
- User schema: email, password (hashed), name, role (admin/user)
- Admin: generate invite codes, list users
- Invite code schema: code, createdBy, usedBy, expiresAt

### 4. Projects
- Project schema: name, description, owner, members[]
- CRUD operations
- Member management (add/remove members)
- Only members can access project resources

### 5. Tasks
- Task schema: title, status (Todo/InProgress/Done), deadline, priority (Low/Medium/High), assignee, project, createdBy
- CRUD within a project context
- Assign/reassign to project members
- Status transitions

### 6. Search
- Elasticsearch index for tasks
- Full-text search by title
- Filter by status, priority, assignee, project
- Sync from MongoDB via RabbitMQ events

### 7. Notifications
- Consumes RabbitMQ events (task.assigned, task.updated, member.added)
- Stores in-app notifications
- Pushes to connected clients via WebSockets

### 8. Gateway (WebSockets)
- NestJS Gateway with Socket.io
- Real-time events: task created/updated/deleted, notifications
- Room-based: users subscribe to project rooms

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
1. Docker Compose (infrastructure services)
2. Backend: config → auth → users → projects → tasks → search → notifications → gateway
3. Frontend: core/auth → projects → tasks/kanban → search → real-time → admin
4. Dockerfiles for backend & frontend
5. Integration testing & polish
