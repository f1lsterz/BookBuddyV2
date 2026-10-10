import fs from "fs";

const map = {
  "get-library": "LibraryCmd.GET_LIBRARY",
  "create-custom-library": "LibraryCmd.CREATE_CUSTOM",
  "delete-custom-library": "LibraryCmd.DELETE_CUSTOM",
  "get-books-in-library": "LibraryCmd.GET_BOOKS",
  "add-book-to-library": "LibraryCmd.ADD_BOOK",
  "remove-book-from-library": "LibraryCmd.REMOVE_BOOK",
  "check-book-in-library": "LibraryCmd.CHECK_BOOK",
  "update-library-visibility": "LibraryCmd.UPDATE_VISIBILITY",
  "count-books": "BookCmd.COUNT",
  "get-books": "BookCmd.GET_LIST",
  "get-book-by-id": "BookCmd.GET_BY_ID",
  "add-comment-to-book": "BookCmd.ADD_COMMENT",
  "get-comments-for-book": "BookCmd.GET_COMMENTS",
  "delete-comment": "BookCmd.DELETE_COMMENT",
  "toggle-reaction": "BookCmd.TOGGLE_REACTION",
  "get-average-rating": "BookCmd.GET_AVERAGE_RATING",
  "get-user-book-rating": "BookCmd.GET_USER_RATING",
  "upsert-user-book-rating": "BookCmd.UPSERT_USER_RATING",
  "delete-user-book-rating": "BookCmd.DELETE_USER_RATING",
  "create-book-club": "ClubCmd.CREATE",
  "search-clubs": "ClubCmd.SEARCH",
  "get-all-clubs": "ClubCmd.GET_ALL",
  "get-club": "ClubCmd.GET",
  "update-book-club": "ClubCmd.UPDATE",
  "delete-book-club": "ClubCmd.DELETE",
  "add-member": "ClubCmd.ADD_MEMBER",
  "leave-from-club": "ClubCmd.LEAVE",
  "remove-member-from-club": "ClubCmd.REMOVE_MEMBER",
  "is-user-in-club": "ClubCmd.IS_USER_IN_CLUB",
  "is-user-in-any-club": "ClubCmd.IS_USER_IN_ANY_CLUB",
  "chat.send-message": "ChatCmd.SEND_MESSAGE",
  "chat.get-messages-by-club": "ChatCmd.GET_BY_CLUB",
  "chat.get-messages-by-user": "ChatCmd.GET_BY_USER",
  "chat.delete-message": "ChatCmd.DELETE_MESSAGE",
  "chat.clear-club-messages": "ChatCmd.CLEAR_CLUB",
  "get-user-by-id": "UserCmd.GET_BY_ID",
  "get-user-by-email": "UserCmd.GET_BY_EMAIL",
  "create-user": "UserCmd.CREATE",
  "update-user": "UserCmd.UPDATE",
  "delete-user": "UserCmd.DELETE",
  "send-friend-request": "UserCmd.SEND_FRIEND_REQUEST",
  "accept-friend-request": "UserCmd.ACCEPT_FRIEND_REQUEST",
  "decline-friend-request": "UserCmd.DECLINE_FRIEND_REQUEST",
  "get-pending-friend-requests": "UserCmd.GET_PENDING_FRIEND_REQUESTS",
  "get-friends": "UserCmd.GET_FRIENDS",
  "remove-friend": "UserCmd.REMOVE_FRIEND",
};

const files = [
  "api-gateway/src/controllers/library.controller.ts",
  "api-gateway/src/controllers/book.controller.ts",
  "api-gateway/src/controllers/club.controller.ts",
  "api-gateway/src/controllers/chat.controller.ts",
  "user/src/user.listener.ts",
  "book/src/book.listener.ts",
  "library/src/library.listener.ts",
  "club/src/club.listener.ts",
  "chat/src/chat.listener.ts",
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  for (const [cmd, constant] of Object.entries(map)) {
    content = content.replaceAll(`cmd: "${cmd}"`, `cmd: ${constant}`);
  }
  fs.writeFileSync(file, content);
}
