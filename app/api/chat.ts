import { client } from "./../config/api";

interface ApiResponse {
  success: boolean;
  message: string;
}

interface ChatResponse {
  _id: string;
  participants: string[];
  messages: string[];
}

/**
 * Creates a new chat.
 */
export async function createChat(participants: string[]): Promise<ApiResponse & ChatResponse> {
  const response: ApiResponse & ChatResponse = { success: false, message: "Something went wrong", _id: "", participants: [], messages: [] };
  const res = await client.post<ChatResponse>("/chats", { participants });

  if (res.status === 201) {
    response.success = true;
    response.message = "Chat created successfully";
    response._id = res.data._id;
    response.participants = res.data.participants;
    response.messages = res.data.messages;
  }
  return response;
}

/**
 * Retrieves messages for a specific chat ID.
 */
export async function getMessages(chatId: string): Promise<ApiResponse & { messages: any[] }> {
  const response: ApiResponse & { messages: any[] } = { success: false, message: "Something went wrong", messages: [] };
  const res = await client.get(`/chats/${chatId}/messages`);

  if (res.status === 200) {
    response.success = true;
    response.messages = res.data;
  }
  return response;
}
