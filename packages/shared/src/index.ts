export { AppError } from "./errors/app-error";
export { ErrorCode } from "./errors/error-codes";
export type { ApiErrorBody, RpcErrorPayload } from "./errors/rpc-error-payload";
export {
  parseRpcClientError,
  toApiErrorBody,
  toRpcErrorPayload,
} from "./errors/normalize-error";

export { Role } from "./contracts/role";
export { LibraryVisibility } from "./contracts/library-visibility";
export { CommentReactionType } from "./contracts/comment-reaction";

export { LoginDto } from "./dto/auth/login.dto";
export { RegistrationDto } from "./dto/auth/registration.dto";
export { RefreshTokenDto } from "./dto/auth/refresh-token.dto";
export { RefreshTokenBodyDto } from "./dto/auth/refresh-token-body.dto";
export { ForgotPasswordDto, ResetPasswordDto } from "./dto/auth/password-reset.dto";
export { parseRefreshExpiresMs } from "./auth/refresh-ttl";
export { AuthTokensDto } from "./dto/auth/auth-tokens.dto";
export { SendMessageDto, SendMessageBodyDto } from "./dto/chat/send-message.dto";
export { SendMessageWsDto } from "./dto/chat/send-message-ws.dto";
export {
  DeleteChatMessageBodyDto,
  DeleteChatMessageRpcDto,
} from "./dto/chat/delete-message.dto";
export {
  ClubMessagesQueryDto,
  UserMessagesQueryDto,
} from "./dto/chat/messages-query.dto";
export {
  ClubMessagesRpcDto,
  ClearClubChatRpcDto,
} from "./dto/chat/club-messages-rpc.dto";
export { CreateUserDto } from "./dto/user/create-user.dto";
export { UpdateUserDto } from "./dto/user/update-user.dto";
export { SendFriendRequestDto } from "./dto/user/send-friend-request.dto";
export { SendFriendRequestBodyDto } from "./dto/user/send-friend-request-body.dto";
export { RemoveFriendDto } from "./dto/user/remove-friend.dto";
export { FriendRequestActionRpcDto } from "./dto/user/friend-request-action-rpc.dto";
export { UserPairRpcDto } from "./dto/user/user-pair-rpc.dto";
export {
  ListNotificationsQueryDto,
  ListNotificationsRpcDto,
  MarkNotificationReadRpcDto,
} from "./dto/user/list-notifications.dto";
export { UpdateUserRpcDto } from "./dto/user/update-user-rpc.dto";
export { CreateClubDto, CreateClubRpcDto } from "./dto/club/create-club.dto";
export { CreateClubBodyDto } from "./dto/club/create-club-body.dto";
export { UpdateClubDto, UpdateClubRpcDto } from "./dto/club/update-club.dto";
export { SearchClubsDto } from "./dto/club/search-clubs.dto";
export {
  AddClubMemberDto,
  ClubIdUserIdRpcDto,
  ClubIdActorRpcDto,
  ClubMemberChangeRpcDto,
  ClubUserMembershipRpcDto,
} from "./dto/club/club-member.dto";
export { CreateCustomLibraryDto } from "./dto/library/create-custom-library.dto";
export { CreateCustomLibraryBodyDto } from "./dto/library/create-custom-library-body.dto";
export { UpdateLibraryVisibilityBodyDto } from "./dto/library/update-library-visibility-body.dto";
export { LibraryUserScopeDto } from "./dto/library/library-scope.dto";
export {
  LibraryViewerScopeDto,
  LibraryViewerBooksDto,
} from "./dto/library/library-viewer.dto";
export { LibraryBookBodyDto } from "./dto/library/library-book-body.dto";
export { LibraryBookPayloadDto } from "./dto/library/library-book-payload.dto";
export { UpdateLibraryVisibilityDto } from "./dto/library/update-library-visibility.dto";
export { GetBooksQueryDto } from "./dto/book/get-books-query.dto";
export { AddCommentDto, AddCommentBodyDto } from "./dto/book/add-comment.dto";
export { DeleteCommentBodyDto, DeleteCommentRpcDto } from "./dto/book/delete-comment.dto";
export { ToggleReactionDto, ToggleReactionBodyDto } from "./dto/book/toggle-reaction.dto";
export {
  BookUserRpcDto,
  UpsertBookRatingBodyDto,
  UpsertBookRatingRpcDto,
} from "./dto/book/book-rating.dto";

export {
  RmqQueue,
  queueForClientName,
  resolveRmqQueue,
  type RmqQueueName,
} from "./rmq/queues";
export { createRmqTransportOptions } from "./rmq/options";
export {
  createRmqDomainDlqPublisherOptions,
  createRmqDomainDlqSubscriberOptions,
  createRmqDomainEventPublisherOptions,
  createRmqDomainEventSubscriberOptions,
  DOMAIN_EVENTS_DLQ,
} from "./rmq/domain-event-bus";
export {
  DOMAIN_EVENT_DLX,
  OUTBOX_DEAD_LETTER_ROUTING_KEY,
  type OutboxDeadLetterPayload,
} from "./rmq/domain-dlq";
export type {
  FailedOutboxEntryDto,
  ListFailedOutboxRpcDto,
  ReplayFailedOutboxRpcDto,
  ReplayFailedOutboxResult,
} from "./outbox/outbox-admin.dto";
export {
  DOMAIN_EVENT_EXCHANGE,
  DomainEventPattern,
  type DomainEventEnvelope,
  type DomainEventPatternName,
} from "./rmq/domain-events";
export type { ClubMemberJoinedPayload } from "./events/club-member-joined.event";
export type { ClubMemberLeftPayload } from "./events/club-member-left.event";
export type {
  FriendRequestSentPayload,
  FriendRequestAcceptedPayload,
} from "./events/friend-request.events";
export { AuthCmd, BookCmd, ChatCmd, ClubCmd, LibraryCmd, UserCmd } from "./rmq/commands";
export { HealthCmd, type ServiceHealthResponse } from "./rmq/health";

export {
  DOMAIN_OUTBOX_BATCH_SIZE,
  DOMAIN_OUTBOX_FLUSH_INTERVAL_MS,
  DOMAIN_OUTBOX_MAX_ATTEMPTS,
  computeDomainOutboxNextRetryAt,
} from "./outbox/domain-outbox";

export const BOOKBUDDY_SHARED_VERSION = "0.0.1";
