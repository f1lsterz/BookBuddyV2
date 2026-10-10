# Library service — layered layout

```
library/src/
  transport/library.listener.ts
  application/library.application.service.ts
  domain/library.policy.ts          # visibility, ownership, duplicate book
  infrastructure/library.repository.ts
  infrastructure/book-catalog.client.ts   # RMQ → book service
```

See: [club-layers.md](./club-layers.md), [user-layers.md](./user-layers.md)
