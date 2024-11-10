export interface FriendRequest {
  username: string,
  id: string
}

export interface Friend extends FriendRequest {
  chatId: string,
  unreadMessageCount: number
}

export interface Group extends FriendRequest {
  participants: FriendRequest[],
  unreadMessageCount: number
}
