# Club service — layered layout (reference)

```
club/src/
  transport/club.listener.ts     # RMQ @MessagePattern → application
  application/club.application.service.ts  # use cases, cache, orchestration
  domain/club-membership.policy.ts       # invariants (AppError, no Mongoose)
  infrastructure/club.repository.ts      # Mongoose persistence
  config/
schemas/                         # Mongoose models (infrastructure detail)
```

**Rule of thumb:** new business rule → `domain/`; new query/save → `repository`; new RMQ cmd → `transport` + `@bookbuddy/shared` `ClubCmd`.

Other services can mirror this pattern (e.g. `user` next).
