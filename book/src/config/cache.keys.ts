const CACHE_PREFIX = process.env.CACHE_PREFIX || "book-cache";

export const CACHE_BOOKS = {
  BOOK: (id: string) => `${CACHE_PREFIX}:book:id:${id}`,
  BOOK_LIST: (page: number, limit: number, query: string) =>
    `${CACHE_PREFIX}:books:page:${page}:limit:${limit}:q:${query}`,
  COMMENTS: (bookId: string) => `${CACHE_PREFIX}:book:${bookId}:comments`,
};
