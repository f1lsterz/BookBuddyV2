/** User document shape returned by user microservice over RMQ (auth flows). */
export type AuthUserRecord = {
  _id: { toString(): string };
  email: string;
  password: string;
  role: string;
  name?: string;
  photoUrl?: string;
};
