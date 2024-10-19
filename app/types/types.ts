export interface FriendRequest {
  username: string,
  id: string
}

export interface Friend extends FriendRequest {
  chatId: string
}

export interface Group extends FriendRequest {
  participants: FriendRequest[]
}
