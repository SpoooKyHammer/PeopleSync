import { client } from "./../config/api";

interface ApiResponse {
  success: boolean;
  message: string;
}

interface GroupResponse {
  _id: string;
  name: string;
  participants: string[];
}

/**
 * Creates a new group.
 */
export async function createGroup(name: string, participants: string[]): Promise<ApiResponse & GroupResponse> {
  const response: ApiResponse & GroupResponse = { success: false, message: "Something went wrong", _id: "", name: "", participants: [] };
  const res = await client.post<GroupResponse>('/groups', { name, participants });

  if (res.status === 201) {
    response.success = true;
    response.message = "Group created successfully";
    response._id = res.data._id;
    response.name = res.data.name;
    response.participants = res.data.participants;
  }
  return response;
}

/**
 * Adds a user to an existing group.
 */
export async function addUserToGroup(groupId: string, userId: string): Promise<ApiResponse & GroupResponse> {
  const response: ApiResponse & GroupResponse = { success: false, message: "Something went wrong", _id: "", name: "", participants: [] };
  const res = await client.post<GroupResponse>(`/groups/${groupId}/users`, { userId });

  if (res.status === 200) {
    response.success = true;
    response.message = "User added to group successfully";
    response._id = res.data._id;
    response.name = res.data.name;
    response.participants = res.data.participants;
  } else if (res.status === 400) {
    response.message = "User is already in the group";
  } else if (res.status === 403) {
    response.message = "Not authorized";
  }
  return response;
}

/**
 * Removes a user from an existing group.
 */
export async function removeUserFromGroup(groupId: string, userId: string): Promise<ApiResponse & GroupResponse> {
  const response: ApiResponse & GroupResponse = { success: false, message: "Something went wrong", _id: "", name: "", participants: [] };
  const res = await client.delete<GroupResponse>(`/groups/${groupId}/users/${userId}`);

  if (res.status === 200) {
    response.success = true;
    response.message = "User removed from group successfully";
    response._id = res.data._id;
    response.name = res.data.name;
    response.participants = res.data.participants;
  } else if (res.status === 400) {
    response.message = "User is not in the group";
  } else if (res.status === 403) {
    response.message = "Not authorized";
  }
  return response;
}

/**
 * Retrieves messages for a specific group ID.
 */
export async function getGroupMessages(id: string): Promise<ApiResponse & { messages: any[] }> {
  const response: ApiResponse & { messages: any[] } = { success: false, message: "Something went wrong", messages: [] };
  const res = await client.get(`/groups/${id}/messages`);

  if (res.status === 200) {
    response.success = true;
    response.messages = res.data;
  }
  return response;
}

