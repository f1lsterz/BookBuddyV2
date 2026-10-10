export const HealthCmd = {
  PING: "health-ping",
} as const;

export type ServiceHealthResponse = {
  ok: boolean;
  service: string;
  reason?: string;
};
