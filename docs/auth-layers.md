# Auth service — layered layout

```
auth/src/
  transport/auth.listener.ts
  application/auth.application.service.ts
  domain/auth.policy.ts
  infrastructure/user-rpc.client.ts   # RMQ → user service
```

No local MongoDB; JWT + bcrypt in application layer.
