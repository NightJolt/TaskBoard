# TaskBoard Backend

## Architecture
Modular monolith built with NestJS 11.

## Tech Stack & Roles
- **NestJS** — REST API framework
- **MongoDB** (Mongoose) — primary data store for users, projects, tasks
- **Redis** — JWT token blacklisting (logout), caching, rate limiting (deferred)
- **Elasticsearch** — full-text search across tasks (synced from MongoDB via RabbitMQ events)
- **RabbitMQ** — async event bus for decoupling modules (task assignment notifications, search index sync, activity logging)

## Patterns

### Controllers split by access level
Each feature has up to 3 controllers sharing the same route prefix:
- `*-public.controller.ts` — no decorator, no auth
- `*-authed.controller.ts` — `@Authenticated()`, any valid JWT
- `*-admin.controller.ts` — `@Authenticated('admin')`, admin only

### Services split the same way
- `*-system.service.ts` — shared utilities used by other services
- `*-public.service.ts` — public endpoint logic
- `*-admin.service.ts` — admin endpoint logic

### `@Authenticated()` decorator
Single decorator that combines `SetMetadata` + `UseGuards(RolesGuardian)`:
- No decorator = public endpoint
- `@Authenticated()` = any authenticated user
- `@Authenticated('admin')` = admin only
- `@Authenticated('user', 'admin')` = multiple roles
- Applied at **class level only** (not per-method)

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
- Request DTOs: `{module}.requests.ts` with `*Req` suffix (e.g. `LoginReq`, `RegisterReq`)
- Response DTOs: `{module}.responses.ts` with `*Res` suffix (e.g. `UserRes`)
- All in a single file per module, no `dto/` directory
- Response DTOs use `@Exclude()` class-level + `@Expose()` per field (whitelist approach)
- Use `plainToInstance()` to transform

### Service method signatures
- Pass full `UserDocument` instead of just `user.id`
- Use `user.id` (Mongoose virtual) instead of `user._id.toString()`
- Use proper types (`UserDocument`) instead of `any`

### Environment
- `.env` committed directly (demo project, no secrets)
- No `.env.example` needed

## Module Structure
```
src/
├── common/decorators/     # @Authenticated, @CurrentUser, barrel index
├── users/
│   ├── schemas/           # user.schema.ts, invite-code.schema.ts
│   ├── users.responses.ts # UserRes
│   ├── users.service.ts   # CRUD + admin seeding
│   └── users.module.ts
├── auth/
│   ├── guards/            # roles.guardian.ts
│   ├── strategies/        # jwt.strategy.ts
│   ├── interfaces/        # jwt-payload.interface.ts
│   ├── auth.requests.ts   # LoginReq, RegisterReq
│   ├── services/          # auth-system, auth-public, auth-admin
│   ├── controllers/       # auth-public, auth-authed, auth-admin
│   └── auth.module.ts
├── projects/              # TBD
├── tasks/                 # TBD
├── search/                # TBD
├── notifications/         # TBD
├── app.module.ts
└── main.ts
```

## Auth & Invite Flow
- JWT-based authentication (access token only, refresh deferred)
- Admin seeded from env vars on first boot
- Admin generates invite codes, users register with invite code
- Token blacklisting via Redis (deferred)

## Real-time
WebSockets via NestJS Gateway (Socket.io) for live task/project updates (TBD).

## Event Flow (RabbitMQ)
Producer → publishes event → Consumers handle async (TBD).

## Git Conventions
- Clear, focused commits — one logical change per commit
- Descriptive messages explaining "why"
