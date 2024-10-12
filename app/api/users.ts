import { Friend, FriendRequest, Group } from "@/types/types";
import { client, setAuthToken } from "./../config/api";

interface ApiResponse {
  success: boolean;
  message: string;
}

/*
 * Registers a new user with the provided username and password.
* */
export async function registerUser(username: string, password: string): Promise<ApiResponse> {
  let apiResponse: ApiResponse = { success: false, message: "" };
  const res = await client.post("/users/register", { username, password });
  
  switch (res.status) {
    case 201:
      apiResponse.success = true;
      apiResponse.message = "Your account has been created successfully!";
      break;
    case 409:
      apiResponse.message = "This username is already taken. Please choose another one.";
      break;
    default:
      apiResponse.message = "Uh-oh! Something went wrong. Please try again later.";
    }
  return apiResponse;
}

/**
 * Authenticates a user and logs them in.
 */
export async function loginUser(username: string, password: string): Promise<ApiResponse> {
  let apiResponse: ApiResponse = { success: false, message: "" };
  const res = await client.post("/users/login", { username, password });
  
  if (res.status === 200) {
    apiResponse.success = true;
    apiResponse.message = "Login successful.";
    setAuthToken(res.data.token);
  } else if (res.status === 404) {
    apiResponse.message = "User not signed up, please signup.";
  } else {
    apiResponse.message = "Invalid password.";
  }

  return apiResponse;
}

interface FriendsResponse {
  friends: Friend[],
  friendRequests: FriendRequest[]
}

interface FriendsApiResponse extends ApiResponse, FriendsResponse {}


export async function getFriends(): Promise<FriendsApiResponse> {
  const friendsApiRes: FriendsApiResponse = { success: false, message: "Something went wrong", friends: [], friendRequests: [] };
  const res = await client.get<FriendsResponse>("/users/friends");
  
  if (res.status === 200) {
    friendsApiRes.success = true;
    friendsApiRes.friends = res.data.friends;
    friendsApiRes.friendRequests = res.data.friendRequests;
  }

  return friendsApiRes;
}

interface CreatedFriend extends ApiResponse, FriendRequest {}

/**
 * adds friend.
 */
export async function addFriend(username: string): Promise<CreatedFriend> {
  const friend: CreatedFriend = { success: false, message: "Something went wrong", id: "", username };
  const res = await client.post<Friend>("/users/friends", { username });
  
  if (res.status === 200) {
    friend.message = "Friend request sent successfully";
    friend.success = true;
    friend.id = res.data.id;
    friend.username = res.data.username;
  } else if (res.status === 404) {
    friend.message = "Friend not found";
  } else if (res.status === 409) {
    friend.message = "Already a friend";
  }
  return friend;
}


export async function removeFriend(username: string): Promise<CreatedFriend> {
  const friend: CreatedFriend = { success: false, message: "Something went wrong", id: "", username };
  const res = await client.delete<Friend>(`/users/friends/${username}`);

  if (res.status === 200) {
    friend.message = "Friend removed";
    friend.success = true;
    friend.id = res.data.id;
    friend.username = res.data.username;
  } else if (res.status === 404) {
    friend.message = "Friend not found";
  }
  return friend;
}


export async function acceptFriendRequest(username: string): Promise<CreatedFriend> {
  const friend: CreatedFriend = { success: false, message: "Something went wrong", id: "", username };
  const res = await client.put<Friend>("/users/friends/accept", { username });

  if (res.status === 200) {
    friend.message = "Friend request accepted";
    friend.success = true;
    friend.id = res.data.id;
    friend.username = res.data.username;
  } else if (res.status === 404) {
    friend.message = "Friend not found";
  }
  return friend;
}

export async function rejectFriendRequest(username: string): Promise<CreatedFriend> {
  const friend: CreatedFriend = { success: false, message: "Something went wrong", id: "", username };
  const res = await client.put<Friend>("/users/friends/reject", { username });

  if (res.status === 200) {
    friend.message = "Friend request rejected";
    friend.success = true;
    friend.id = res.data.id;
    friend.username = res.data.username;
  } else if (res.status === 404) {
    friend.message = "Friend not found";
  }
  return friend;
}

interface User {
  id: string;
  username: string;
  friends: Friend[];
  friendRequests: FriendRequest[];
  groups: Group[];
}

/**
 * Fetches the current user's details.
 */
export async function getMe(): Promise<{ success: boolean; user: User; message?: string }> {
  try {
    const res = await client.get("/users/me");
    if (res.status === 200) {
      return { success: true, user: res.data };
    } else {
      return { success: false, message: "Failed to fetch user data", user: {} as User };
    }
  } catch (error) {
    return { success: false, message: "An error occurred", user: {} as User };
  }
}

