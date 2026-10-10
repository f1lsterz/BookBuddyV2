# Error handling

## Layers

| Layer                             | What to throw                                                             | Why                                                         |
| --------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Domain / application (`*Service`) | `AppError` from `@bookbuddy/shared`                                       | Transport-agnostic; stable `code` + HTTP status for mapping |
| Microservice (RMQ)                | Caught by `BookbuddyRpcExceptionFilter` → `RpcException` payload          | Gateway receives structured errors, not raw stack traces    |
| API Gateway (HTTP)                | `HttpException` (validation) or errors from RPC via `RpcErrorInterceptor` | Single JSON shape for clients                               |

## Client response (production)

```json
{
  "statusCode": 404,
  "code": "NOT_FOUND",
  "message": "User not found",
  "path": "/users/…",
  "timestamp": "2026-…"
}
```

- No stack traces, no MongoDB internals in `message`.
- `code` is stable for frontend/i18n; `message` is human-readable (English for now).

## Why not `ApiError`?

Custom `ApiError` duplicated what Nest already provides for HTTP and did not integrate with RabbitMQ.
`AppError` is framework-free; Nest adapters live in `@bookbuddy/nest-common`.

## Shared Nest config

`validationConfig`, `TimeoutInterceptor`, and exception filters live in `@bookbuddy/nest-common`.
Do not import from `api-gateway` inside microservices.
