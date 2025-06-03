const CACHE_PREFIX = process.env.CACHE_PREFIX || "dely-cache";

export const CACHE_USERS = {
  USER: (id: number) => `${CACHE_PREFIX}:user:${id}`,
  USER_BY_PHONE: (phone: string) => `${CACHE_PREFIX}:user:${phone}`,
  ALL_USERS: `${CACHE_PREFIX}:users`,
  USER_SESSIONS: (userId: number) => `${CACHE_PREFIX}:user:${userId}:sessions`,
  SESSION: (sessionId: number) => `${CACHE_PREFIX}:session:${sessionId}`,
};

export const CACHE_PRODUCTS = {
  PRODUCT: (id: number) => `${CACHE_PREFIX}:product:${id}`,
  PRODUCT_BY_CATEGORY: (categoryId: number) =>
    `${CACHE_PREFIX}:category:${categoryId}:products`,
  ALL_PRODUCTS: `${CACHE_PREFIX}:products`,
  FAVOURITE_PRODUCTS: (userId: number) =>
    `${CACHE_PREFIX}:user:${userId}:favourites`,
};

export const CACHE_PAYMENTS = {};

export const CACHE_ORDERS = {
  ORDER: (orderId: number) => `${CACHE_PREFIX}:order:${orderId}`,
  ALL_ORDERS: `${CACHE_PREFIX}:orders`,
  USER_ORDERS: (userId: number) => `${CACHE_PREFIX}:user:${userId}:orders`,
  COURIER_ORDERS: (courierId: number) =>
    `${CACHE_PREFIX}:courier:${courierId}:orders`,

  ORDER_PARTS: (orderId: number) => `${CACHE_PREFIX}:order:${orderId}:parts`,
  ORDER_PART: (partId: number) => `${CACHE_PREFIX}:orderpart:${partId}`,

  ORDER_ITEMS: (orderPartId: number) =>
    `${CACHE_PREFIX}:orderpart:${orderPartId}:items`,
  ORDER_ITEM: (orderItemId: number) =>
    `${CACHE_PREFIX}:orderitem:${orderItemId}`,
};

export const CACHE_CHATS = {};

export const CACHE_ADDRESSES = {
  USER_ADDRESSES: (userId: number) =>
    `${CACHE_PREFIX}:user:${userId}:addresses`,
  ADDRESS: (addressId: number) => `${CACHE_PREFIX}:address:${addressId}`,
  ALL_ADDRESSES: `${CACHE_PREFIX}:addresses`,
};

export const CACHE_STORES = {
  STORE: (id: number) => `store:${id}`,
  ALL_STORES: "stores:all",
};
