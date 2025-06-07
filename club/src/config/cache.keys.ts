const CACHE_PREFIX = process.env.CACHE_PREFIX || "book-cache";

export const CACHE_CLUBS = {
  CLUB: (id: string) => `${CACHE_PREFIX}:club:id:${id}`,
  ALL_CLUBS: `${CACHE_PREFIX}:clubs:all`,
  SEARCH_CLUBS: (query: string, filterFull: boolean) =>
    `${CACHE_PREFIX}:clubs:search:${query}:${filterFull}`,
};
