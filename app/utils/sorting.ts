import { Friend } from "@/types/types";

export const sortFriends = (items: Friend[]): Friend[] => {
  return items.sort((a, b) => a.username.localeCompare(b.username));
};
