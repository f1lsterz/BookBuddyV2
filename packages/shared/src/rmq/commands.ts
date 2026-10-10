export const AuthCmd = {
  LOGIN: "auth-login",
  REGISTRATION: "auth-registration",
  REFRESH: "auth-refresh",
  REVOKE_REFRESH: "auth-revoke-refresh",
  FORGOT_PASSWORD: "auth-forgot-password",
  RESET_PASSWORD: "auth-reset-password",
  VALIDATE_GOOGLE_USER: "auth-validate-google-user",
  GENERATE_TOKENS: "auth-generate-tokens",
} as const;

export const UserCmd = {
  GET_BY_ID: "get-user-by-id",
  GET_BY_EMAIL: "get-user-by-email",
  CREATE: "create-user",
  UPDATE: "update-user",
  DELETE: "delete-user",
  SEND_FRIEND_REQUEST: "send-friend-request",
  ACCEPT_FRIEND_REQUEST: "accept-friend-request",
  DECLINE_FRIEND_REQUEST: "decline-friend-request",
  GET_PENDING_FRIEND_REQUESTS: "get-pending-friend-requests",
  GET_FRIENDS: "get-friends",
  REMOVE_FRIEND: "remove-friend",
  ARE_FRIENDS: "are-friends",
  LIST_NOTIFICATIONS: "list-notifications",
  MARK_NOTIFICATION_READ: "mark-notification-read",
  MARK_ALL_NOTIFICATIONS_READ: "mark-all-notifications-read",
  LIST_FAILED_OUTBOX: "user-list-failed-outbox",
  REPLAY_FAILED_OUTBOX: "user-replay-failed-outbox",
} as const;

export const BookCmd = {
  COUNT: "count-books",
  GET_LIST: "get-books",
  GET_BY_ID: "get-book-by-id",
  ADD_COMMENT: "add-comment-to-book",
  GET_COMMENTS: "get-comments-for-book",
  DELETE_COMMENT: "delete-comment",
  TOGGLE_REACTION: "toggle-reaction",
  CALCULATE_AVERAGE_RATING: "calculate-average-rating",
  GET_AVERAGE_RATING: "get-average-rating",
  GET_USER_RATING: "get-user-book-rating",
  UPSERT_USER_RATING: "upsert-user-book-rating",
  DELETE_USER_RATING: "delete-user-book-rating",
} as const;

export const LibraryCmd = {
  GET_LIBRARY: "get-library",
  LIST_LIBRARIES: "list-user-libraries",
  PROVISION_DEFAULT: "provision-default-libraries",
  CREATE_CUSTOM: "create-custom-library",
  DELETE_CUSTOM: "delete-custom-library",
  GET_BOOKS: "get-books-in-library",
  ADD_BOOK: "add-book-to-library",
  REMOVE_BOOK: "remove-book-from-library",
  CHECK_BOOK: "check-book-in-library",
  UPDATE_VISIBILITY: "update-library-visibility",
  LIST_VISIBLE_SHELVES: "list-visible-shelves",
  GET_BOOKS_FOR_VIEWER: "get-books-for-viewer",
} as const;

export const ClubCmd = {
  CREATE: "create-book-club",
  SEARCH: "search-clubs",
  GET_ALL: "get-all-clubs",
  GET: "get-club",
  UPDATE: "update-book-club",
  DELETE: "delete-book-club",
  ADD_MEMBER: "add-member",
  LEAVE: "leave-from-club",
  REMOVE_MEMBER: "remove-member-from-club",
  IS_USER_IN_CLUB: "is-user-in-club",
  IS_USER_IN_ANY_CLUB: "is-user-in-any-club",
  IS_CLUB_ADMIN: "is-club-admin",
  LIST_FAILED_OUTBOX: "club-list-failed-outbox",
  REPLAY_FAILED_OUTBOX: "club-replay-failed-outbox",
} as const;

export const ChatCmd = {
  SEND_MESSAGE: "chat.send-message",
  GET_BY_CLUB: "chat.get-messages-by-club",
  GET_BY_USER: "chat.get-messages-by-user",
  DELETE_MESSAGE: "chat.delete-message",
  CLEAR_CLUB: "chat.clear-club-messages",
} as const;
