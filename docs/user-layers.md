# User service — layered layout

```
user/src/
  transport/user.listener.ts
  application/user.application.service.ts
  domain/user.policy.ts
  domain/friend-request.policy.ts   # PENDING / duplicate / mutual friends
  infrastructure/user.repository.ts
  infrastructure/friend-request.repository.ts
```

Friend-request state rules live in `friend-request.policy.ts` (`assertPending`, duplicate pending, already friends).

See also: [club-layers.md](./club-layers.md)
