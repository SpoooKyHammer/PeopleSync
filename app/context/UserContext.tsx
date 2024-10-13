import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Friend, FriendRequest, Group } from '@/types/types';
import { getMe } from '@/api/users'; // Ensure you have these API methods
import { sortByName } from '@/utils/sorting';
import Spinner from '@/components/Spinner';

interface UserContextType {
  id: string;
  username: string;
  friends: Friend[];
  friendRequests: FriendRequest[];
  groups: Group[];
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
  setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [id, setId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const meRes = await getMe();
        if (meRes.success) {
          setId(meRes.user.id);
          setUsername(meRes.user.username);

          const sortedFriends = sortByName(meRes.user.friends);
          setFriends(sortedFriends);
          
          const sortedFriendRequests = sortByName(meRes.user.friendRequests);
          setFriendRequests(sortedFriendRequests);

          const sortedGroups = sortByName(meRes.user.groups);
          setGroups(sortedGroups);

          setError(null);
        } else {
          setError(meRes.message || "Failed to fetch user data");
        }
      } catch (err) {
        setError("An error occurred while fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <Spinner />
  }

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
