export interface UserPublicInfo {
  email: string;
  name?: string;
}

export interface FriendRequestInfo {
  id: string;
  senderId: string;
  name: string;
  profileImage: string;
}

export interface FriendInfo {
  userId: string;
  name: string;
  profileImage: string;
}

export interface MessageResponse {
  message: string;
}
