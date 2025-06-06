export const CACHE_USERS = {
  USER: (id: string) => `user:id:${id}`,
  USER_BY_EMAIL: (email: string) => `user:email:${email}`,
  ALL_USERS: "users:all",
  FRIENDS: (id: string) => `user:${id}:friends`,
  PENDING_REQUESTS: (id: string) => `user:${id}:friend:pending`,
};
