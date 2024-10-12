import { client } from "./../config/api";

interface ApiResponse {
  success: boolean;
  message: string;
}

interface Message {
  _id: string;
  sender: string;
  content: string;
  chat?: string;
  group?: string;
  isRead: boolean;
}

/**
 * Sends a new message to a chat or group.
 */
export async function sendMessage(props: { content: string, chat?: string, group?: string }): Promise<ApiResponse & Message> {
  const response: ApiResponse & Message = { success: false, message: "Something went wrong", _id: "", sender: "", content: "", isRead: false };
  const res = await client.post<Message>('/messages', { ...props });

  if (res.status === 201) {
    response.success = true;
    response.message = "Message sent successfully";
    response._id = res.data._id;
    response.sender = res.data.sender;
    response.content = res.data.content;
    response.chat = res.data.chat;
    response.group = res.data.group;
    response.isRead = res.data.isRead;
  }
  return response;
}

/**
 * Retrieves details for a specific message by ID.
 */
export async function getMessage(messageId: string): Promise<ApiResponse & Message> {
  const response: ApiResponse & Message = { success: false, message: "Something went wrong", _id: "", sender: "", content: "", isRead: false };
  const res = await client.get<Message>(`/messages/${messageId}`);

  if (res.status === 200) {
    response.success = true;
    response.message = "Message retrieved successfully";
    response._id = res.data._id;
    response.sender = res.data.sender;
    response.content = res.data.content;
    response.chat = res.data.chat;
    response.group = res.data.group;
    response.isRead = res.data.isRead;
  }
  return response;
}

/**
 * Updates a message to mark it as read or unread.
 */
export async function updateMessage(messageId: string, isRead: boolean): Promise<ApiResponse & Message> {
  const response: ApiResponse & Message = { success: false, message: "Something went wrong", _id: "", sender: "", content: "", isRead: false };
  const res = await client.put<Message>(`/messages/${messageId}`, { isRead });

  if (res.status === 200) {
    response.success = true;
    response.message = "Message updated successfully";
    response._id = res.data._id;
    response.sender = res.data.sender;
    response.content = res.data.content;
    response.chat = res.data.chat;
    response.group = res.data.group;
    response.isRead = res.data.isRead;
  }
  return response;
}
