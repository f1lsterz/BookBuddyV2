const CACHE_PREFIX = process.env.CACHE_PREFIX || "book-cache";

export const CACHE_USERS = {
  USER: (id: string) => `${CACHE_PREFIX}:user:id:${id}`,
  USER_BY_EMAIL: (email: string) => `${CACHE_PREFIX}:user:email:${email}`,
  ALL_USERS: `${CACHE_PREFIX}:users:all`,
  FRIENDS: (id: string) => `${CACHE_PREFIX}:user:${id}:friends`,
  PENDING_REQUESTS: (id: string) => `${CACHE_PREFIX}:user:${id}:friend:pending`,
};
