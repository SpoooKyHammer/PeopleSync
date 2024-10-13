export const sortByName = <T extends { username: string }>(items: T[]): T[] => {
  return items.sort((a, b) => a.username.localeCompare(b.username));
};
