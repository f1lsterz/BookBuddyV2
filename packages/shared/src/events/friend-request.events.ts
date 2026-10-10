export type FriendRequestSentPayload = {
  requestId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
};

export type FriendRequestAcceptedPayload = {
  requestId: string;
  senderId: string;
  receiverId: string;
  receiverName: string;
};
