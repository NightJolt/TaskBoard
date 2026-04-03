# TaskBoard Backend

## Architecture
Modular monolith built with NestJS 11.

## Tech Stack & Roles
- **NestJS** — REST API framework
- **MongoDB** (Mongoose) — primary data store for users, projects, tasks
- **Redis** — JWT token blacklisting (logout), caching, rate limiting
- **Elasticsearch** — full-text search across tasks (synced from MongoDB via RabbitMQ events)
- **RabbitMQ** — async event bus for decoupling modules (task assignment notifications, search index sync, activity logging). Integrated via `@nestjs/microservices` + `amqplib`

## Module Structure
```
src/
├── common/            # Guards, decorators, pipes, filters, interceptors
├── config/            # Central config (env vars, validation)
├── auth/              # Login, JWT, guards, token blacklist (Redis)
├── users/             # User CRUD, admin invite flow
├── projects/          # Project CRUD, member management
├── tasks/             # Task CRUD, assignment, status transitions
├── search/            # Elasticsearch indexing & query service
├── notifications/     # Consumes RabbitMQ events, handles notifications
├── app.module.ts
└── main.ts
```

Each module: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.schema.ts` (Mongoose).

## Event Flow (RabbitMQ)
Producer (e.g. TasksService) → publishes event (e.g. `task.assigned`) → Consumers (NotificationsService, SearchService) handle async.

## Real-time
WebSockets via NestJS Gateway (Socket.io) for live task/project updates.

## Auth & Invite Flow
- JWT-based authentication
- Admin generates invite codes, users register with invite code
- Token blacklisting via Redis (for logout)

## Git Conventions
- Clear, focused commits — one logical change per commit
- Descriptive messages explaining "why"
