import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Friend, FriendRequest, Group } from '@/types/types';
import { getMe } from '@/api/users'; // Ensure you have these API methods

interface UserContextType {
  id: string | null;
  username: string | null;
  friends: Friend[];
  friendRequests: FriendRequest[];
  groups: Group[];
  setUsername: React.Dispatch<React.SetStateAction<string | null>>;
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
  setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [id, setId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const meRes = await getMe();
        if (meRes.success) {
          console.log(meRes.user.friends)
          setId(meRes.user.id);
          setUsername(meRes.user.username);
          setFriends(meRes.user.friends);
          setFriendRequests(meRes.user.friendRequests);
          setGroups(meRes.user.groups);
          setError(null);
        } else {
          setError(meRes.message || "Failed to fetch user data");
        }
      } catch (err) {
        setError("An error occurred while fetching user data.");
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ id, username, friends, friendRequests, groups, setUsername, setFriends, setFriendRequests, setGroups, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
