# TaskBoard Backend

## Architecture
Modular monolith built with NestJS 11.

## Tech Stack & Roles
- **NestJS** — REST API framework
- **MongoDB** (Mongoose) — primary data store for users, projects, tasks
- **Redis** (ioredis) — JWT token blacklisting (logout). Global `RedisModule` provides `REDIS_CLIENT` via `@Inject(REDIS_CLIENT)`
- **Elasticsearch** — full-text search across tasks (synced from MongoDB via RabbitMQ events)
- **RabbitMQ** — async event bus for decoupling modules (task assignment notifications, search index sync, activity logging)

## Strict Rules
- **Never use `any`** — always use proper TypeScript types. Use spread to build new objects instead of casting.
- **Decorators are class-level only** — never on individual methods
- **`@Authenticated` must be closest to `@Controller`** — decorators apply bottom-to-top, auth must run before other guards

## Patterns

### Controllers split by access level
Each feature has up to 3 controllers sharing the same route prefix:
- `*-public.controller.ts` — no decorator, no auth
- `*-authed.controller.ts` — `@Authenticated()`, any valid JWT
- `*-member.controller.ts` — `@ProjectMembership()` + `@Authenticated()`, project members
- `*-owner.controller.ts` — `@ProjectMembership(ProjectAccess.Owner)` + `@Authenticated()`, project owners
- `*-admin.controller.ts` — `@Authenticated('admin')`, admin only

### Services split the same way
- `*-system.service.ts` — shared utilities used by other services
- `*-public.service.ts` — public endpoint logic
- `*-authed.service.ts` — authenticated user logic
- `*-owner.service.ts` — owner-only logic
- `*-admin.service.ts` — admin endpoint logic

### `@Authenticated()` decorator
Single decorator that combines `SetMetadata` + `UseGuards(RolesGuardian)`:
- No decorator = public endpoint
- `@Authenticated()` = any authenticated user
- `@Authenticated('admin')` = admin only
- `@Authenticated('user', 'admin')` = multiple roles
- Applied at **class level only** (not per-method)

### `@ProjectMembership()` decorator
Combines `SetMetadata` + `UseGuards(ProjectMembershipGuard)`:
- `@ProjectMembership()` = any project member
- `@ProjectMembership(ProjectAccess.Owner)` = project owner only
- Guard loads project from `:id` param, verifies membership, attaches to `request.project`
- Applied at **class level only**

### `@CurrentProject()` decorator
Extracts `request.project` (set by `ProjectMembershipGuard`). Same pattern as `@CurrentUser()`.

### `RolesGuardian`
Single guard extending `AuthGuard('jwt')` that handles both JWT validation and role checking. Not registered globally — attached per-controller via `@Authenticated()`.

### Schema type conventions
In every schema file, declare types after the class, before the schema constant:
```ts
export class User { ... }

export type UserDocument = HydratedDocument<User>;
export type UserModel = Model<UserDocument>;

export const UserSchema = SchemaFactory.createForClass(User);
```
Use `UserModel` instead of `Model<UserDocument>` when injecting. Use `import type` for model types in decorated constructors.

### Request/Response DTOs
- Live under `dto/` directory in each module
- Request DTOs: `dto/{module}.requests.ts` with `*Req` suffix (e.g. `LoginReq`, `RegisterReq`)
- Response DTOs: `dto/{module}.responses.ts` with `*Res` suffix (e.g. `UserRes`, `InviteCodeRes`)
- Response DTOs use `@Exclude()` class-level + `@Expose()` per field (whitelist approach)
- Use `plainToInstance()` to transform

### Service method signatures
- Pass full document (e.g. `UserDocument`, `ProjectDocument`) instead of just IDs
- Use `._id` (ObjectId) for database queries and `create()` calls — Mongoose does NOT auto-cast strings to ObjectIds
- Use `.id` (string) only for string comparisons and response data
- Use proper types — never `any`

### Swagger
- Available at `/docs`, token persists across reloads (`persistAuthorization`)
- Plugin configured in `nest-cli.json` to scan `*.requests.ts` and `*.responses.ts`
- Auto-generates schemas from DTOs
- `@ApiBearerAuth()` bundled in `@Authenticated()`, `@ApiParam('id')` bundled in `@ProjectMembership()`

### Environment
- `.env` committed directly (demo project, no secrets)
- No `.env.example` needed

## Module Structure
```
src/
├── common/decorators/       # @Authenticated, @CurrentUser, @CurrentProject,
│                            # @ProjectMembership, barrel index
├── users/
│   ├── schemas/             # user.schema.ts, invite-code.schema.ts
│   ├── dto/                 # users.responses.ts (UserRes)
│   ├── users.service.ts     # CRUD + admin seeding
│   └── users.module.ts
├── auth/
│   ├── guards/              # roles.guardian.ts
│   ├── strategies/          # jwt.strategy.ts
│   ├── interfaces/          # jwt-payload.interface.ts
│   ├── dto/                 # auth.requests.ts, auth.responses.ts
│   ├── services/            # auth-system, auth-public, auth-admin, token-blacklist
│   ├── controllers/         # auth-public, auth-authed, auth-admin
│   └── auth.module.ts
├── projects/
│   ├── schemas/             # project.schema.ts, project-member.schema.ts
│   ├── guards/              # project-membership.guard.ts
│   ├── dto/                 # projects.requests.ts, projects.responses.ts
│   ├── services/            # projects-authed, projects-owner
│   ├── controllers/         # projects-authed, projects-member, projects-owner
│   └── projects.module.ts
├── tasks/
│   ├── schemas/             # task.schema.ts
│   ├── dto/                 # tasks.requests.ts, tasks.responses.ts
│   ├── services/            # tasks-member
│   ├── controllers/         # tasks-member
│   └── tasks.module.ts
├── redis/
│   └── redis.module.ts      # Global Redis provider (REDIS_CLIENT)
├── events/
│   ├── events.service.ts    # Redis Pub/Sub publisher
│   ├── events.gateway.ts    # Socket.io gateway, subscribes to Redis
│   └── events.module.ts     # Global module
├── app.module.ts
└── main.ts
```

## Data Model
- **User** — email, password (bcrypt), name, role (admin/user)
- **InviteCode** — code, createdBy (ref User), usedBy (ref User), expiresAt, isUsed
- **Task** — title, status (todo/in_progress/done), deadline, priority (low/medium/high), assignee (ref User), project (ref Project), createdBy (ref User). Index on (project, status). Assignee must be a project member.
- **Project** — name, description, owner (ref User)
- **ProjectMember** — project (ref Project), user (ref User), role (owner/member). Separate collection for scalability. Compound unique index on (project, user).

## Auth & Invite Flow
- JWT-based authentication with JTI (unique token ID per token)
- Access token (15m) + refresh token (7d) pair
- Login/register returns both tokens + user
- `POST /api/auth/refresh` — accepts refresh token, blacklists old one (single-use), returns new pair
- Logout blacklists access token JTI in Redis with TTL matching remaining lifetime
- JWT strategy checks blacklist on every authenticated request
- Admin seeded from env vars on first boot
- Admin generates invite codes, users register with invite code

## Real-time (Redis Pub/Sub + WebSockets)
- **EventsService** — publishes `AppEvent` to Redis channel `app_events`
- **EventsGateway** — Socket.io gateway, subscribes to Redis, pushes to project rooms
- Clients join/leave rooms via `joinProject`/`leaveProject` socket messages
- Events: `task.created` (full task), `task.updated` (full task), `task.deleted` (taskId)
- Frontend updates local signal state directly — no refetching
- Global `EventsModule` — any service can inject `EventsService` to publish

## Git Conventions
- Clear, focused commits — one logical change per commit
- Descriptive messages explaining "why"
