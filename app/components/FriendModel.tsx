import Image from 'next/image';
import { XIcon } from '@heroicons/react/solid';
import defaultAvatar from './../assets/chatting.png';
import React, { useRef, useEffect, useState } from 'react';
import { addFriend, removeFriend, acceptFriendRequest, rejectFriendRequest } from '@/api/users';
import { useUserContext } from '@/context/UserContext';
import { createChat } from '@/api/chat';

interface FriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendModal: React.FC<FriendModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { id, friends, friendRequests, setFriends, setFriendRequests } = useUserContext();
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSendRequest = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (usernameInput.trim() === '') {
      setErrorMessage('Username cannot be empty.');
      return;
    }

    try {
      const res = await addFriend(usernameInput.trim());
      if (res.success) {
        setSuccessMessage('Friend request sent successfully.');
        setUsernameInput('');
      } else {
        setErrorMessage(res.message);
      }
    } catch (error) {
      setErrorMessage('Failed to send friend request.');
    }
  };

  const handleRemoveFriend = async (username: string) => {
    try {
      const res = await removeFriend(username);
      if (res.success) {
        setSuccessMessage('Friend removed successfully.');
        setFriends((prevFriends) => prevFriends.filter((f) => f.username !== username));
      } else {
        setErrorMessage(res.message);
      }
    } catch (error) {
      setErrorMessage('Failed to remove friend.');
    }
  };

  const handleAcceptRequest = async (username: string) => {
    try {
      const res = await acceptFriendRequest(username);
      if (res.success) {
        const chat = await createChat([id!, res.id]);
        setSuccessMessage('Friend request accepted.');
        setFriendRequests((prevRequests) => prevRequests.filter((r) => r.username !== username));
        setFriends((prevFriends) => [...prevFriends, { id: res.id, username: res.username, chatId: chat._id }]);
      } else {
        setErrorMessage(res.message);
      }
    } catch (error) {
      setErrorMessage('Failed to accept friend request.');
    }
  };

  const handleRejectRequest = async (username: string) => {
    try {
      const res = await rejectFriendRequest(username);
      if (res.success) {
        setSuccessMessage('Friend request rejected.');
        setFriendRequests((prevRequests) => prevRequests.filter((r) => r.username !== username));
      } else {
        setErrorMessage(res.message);
      }
    } catch (error) {
      setErrorMessage('Failed to reject friend request.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-8 rounded-lg shadow-lg w-full max-w-lg"
      >
        <h2 className="text-2xl font-semibold mb-6">Friends Management</h2>

        {/* Section for Viewing Friends */}
        <div className="mb-6 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">Friends List</h3>
          <ul className="space-y-2">
            {friends.map((friend) => (
              <li
                key={friend.id}
                className="p-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src={defaultAvatar}
                    alt={`${friend.username}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{friend.username}</span>
                </div>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveFriend(friend.username)}
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Section for Viewing Pending Friend Requests */}
        <div className="mb-6 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">Pending Friend Requests</h3>
          <ul className="space-y-2">
            {friendRequests.map((request) => (
              <li
                key={request.id}
                className="p-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src={defaultAvatar}
                    alt={`${request.username}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{request.username}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-green-500 hover:text-green-700"
                    onClick={() => handleAcceptRequest(request.username)}
                  >
                    Accept
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRejectRequest(request.username)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Section for Sending Friend Requests */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Send Friend Request</h3>
          <input
            type="text"
            placeholder="Enter username"
            className="input input-bordered w-full mb-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 rounded-md"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />
          <button
            className="btn btn-primary w-full"
            onClick={handleSendRequest}
          >
            Send Request
          </button>
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
          {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
        </div>

        <button
          className="btn btn-error mt-4 w-full"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FriendModal;
