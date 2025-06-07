const CACHE_PREFIX = process.env.CACHE_PREFIX || "book-cache";

export const CACHE_LIBRARY = {
  LIBRARY: (userId: string) => `${CACHE_PREFIX}:library:user:${userId}`,
  CUSTOM_LIBRARIES: (userId: string) =>
    `${CACHE_PREFIX}:libraries:custom:${userId}`,
  BOOKS: (libraryId: string) => `${CACHE_PREFIX}:library:${libraryId}:books`,
};
