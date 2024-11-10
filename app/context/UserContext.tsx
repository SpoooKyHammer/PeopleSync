import React, { createContext, useState, useEffect, useContext, ReactNode, useRef, useCallback } from 'react';
import { Friend, FriendRequest, Group } from '@/types/types';
import { getMe } from '@/api/users';
import { sortByName } from '@/utils/sorting';
import Spinner from '@/components/Spinner';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/components/ChatArea';
import { isNumber } from 'util';

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
  hasSeenMessage: (content: string, senderId: string, groupId: string) => boolean;
  addMessageToSeen: (content: string, senderId: string, groupId: string) => void;
  setOpenChat: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [id, setId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSeenMessages, setGroupSeenMessages] = useState<Map<string, Set<string>>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const socket = useRef<Socket | null>(null);
  const openChatRef = useRef("");

  const setOpenChat = (id: string) => {
    openChatRef.current = id;
  }

  const handleNewMessage = useCallback((m: Message) => {
    if (m.sender._id === id) return;

    if (m.chat) {
      setFriends(prev => {
        const updatedFriends = prev.map(f => {
          if (f.chatId === m.chat && f.chatId !== openChatRef.current) {
            return {
              ...f,
              unreadMessageCount: isNumber(f.unreadMessageCount) ? f.unreadMessageCount + 1 : 1
            }
          }
          return f;
        });
        return updatedFriends;
      });
    }
    
    if (m.group) {
      setGroups(prev => {
        const updatedGroups = prev.map(g => {
          if (g.id === m.group && g.id !== openChatRef.current && !hasSeenMessage(m.content, m.sender._id, g.id)) {
            return {
              ...g,
              unreadMessageCount: isNumber(g.unreadMessageCount) ? g.unreadMessageCount + 1 : 1
            }
          }
          return g;
        });
        return updatedGroups;
      });
    }
  }, [id, friends, groups]);


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

  useEffect(() => {
    socket.current = io(process.env.NEXT_PUBLIC_BASE_SOCKET_URL);

    socket.current?.on("newMessage", handleNewMessage);

    if (friends.length > 0 || groups.length > 0) {
      friends.forEach(f => {
        socket.current?.emit("joinChat", f.chatId);
      });

      groups.forEach(g => {
        socket.current?.emit("joinChat", g.id);
      });
    }

    return () => {
      friends.forEach(f => {
        socket.current?.emit("leaveChat", f.chatId);
      });

      groups.forEach(g => {
        socket.current?.emit("leaveChat", g.id);
      });

      socket.current?.off("newMessage", handleNewMessage);
    }
  }, [friends, groups])

  const hashContent = (content: string, senderId: string) => {
    return `${content}-${senderId}`;
  };

  const hasSeenMessage = (content: string, senderId: string, groupId: string) => {
    const messageHash = hashContent(content, senderId);
    
    const seenGroups = groupSeenMessages.get(messageHash);
    if (!seenGroups) return false;

    return !seenGroups.has(groupId);
  };

  const addMessageToSeen = (content: string, senderId: string, groupId: string) => {
    const messageHash = hashContent(content, senderId);
    
    setGroupSeenMessages((prevSeen) => {
      const updatedSeenGroups = new Set(prevSeen.get(messageHash) || []);
      updatedSeenGroups.add(groupId);

      const updatedMap = new Map(prevSeen);
      updatedMap.set(messageHash, updatedSeenGroups);
      
      return updatedMap;
    });
  };

  // // Function to handle new WebSocket message
  // const handleNewMessage = (message: any) => {
  //   // Check if the message has been seen already
  //   if (hasSeenMessage(message.content)) {
  //     return;
  //   }
  //
  //   // Otherwise, render the message
  //   // renderMessage(message);
  //
  //   // Mark it as seen
  //   addMessageToSeen(message.content);
  // };

  if (loading) {
    return <Spinner />
  }

  return (
    <UserContext.Provider value={{ 
      id, username, friends, friendRequests, groups, setUsername, setFriends, setFriendRequests, setGroups, error,
      hasSeenMessage, addMessageToSeen, setOpenChat
    }}>
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
