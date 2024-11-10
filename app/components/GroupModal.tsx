import Image from 'next/image';
import { PlusIcon, XIcon } from '@heroicons/react/solid';
import defaultAvatar from './../assets/chatting.png';
import React, { useRef, useEffect, useState } from 'react';
import { createGroup, addUserToGroup, removeUserFromGroup } from '@/api/group';
import { useUserContext } from '@/context/UserContext';
import { FriendRequest, Group } from '@/types/types';
import { sortByName } from '@/utils/sorting';

interface GroupManagementProps {
  type: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  selectedGroup?: Group;
  setSelectGroup?: (group: Group | null) => void 
}

const GroupManagement: React.FC<GroupManagementProps> = ({ type, isOpen, onClose, selectedGroup, setSelectGroup }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { id, groups, setGroups, friends } = useUserContext();
  const [groupNameInput, setGroupNameInput] = useState<string>("");
  const [groupMembers, setGroupMembers] = useState<FriendRequest[]>([]);
  const [friendsLocal, setFriendsLocal] = useState<FriendRequest[]>([...friends] as FriendRequest[]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (type === "edit" && selectedGroup) {
        setGroupNameInput(selectedGroup.username);
        setGroupMembers(selectedGroup.participants.filter(p => p.id !== id));
        const memberIdsSet = new Set(selectedGroup.participants.map(p => p.id));
        setFriendsLocal(friends.filter(f => !memberIdsSet.has(f.id)));
      }    
    } else {
      // Reset state when modal is closed
      setGroupNameInput("");
      setGroupMembers([]);
      setFriendsLocal([...friends]);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, friends, type, selectedGroup])

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

  const handleCreateGroup = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (groupNameInput.trim() === '') {
      setErrorMessage('Group name cannot be empty.');
      return;
    }

    if (groupMembers.length < 2) {
      setErrorMessage("Add atleast 2 or more members");
      return;
    }

    try {
      setLoading(true);
      const memberIds = groupMembers.map(member => member.id);
      const res = await createGroup(groupNameInput.trim(), [id].concat(memberIds));
      if (res.success) {
        setSuccessMessage('Group created successfully.');
        setGroups((prevGroups) => [...prevGroups, { username: res.name, id: res._id, participants: groupMembers, unreadMessageCount: 0 }]);
        setGroupNameInput('');
      } else {
        setErrorMessage(res.message);
      }
    } catch (error) {
      setErrorMessage('Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const originalParticipantIds = new Set(selectedGroup.participants.map(p => p.id));
    const groupMemberIds = new Set(groupMembers.map(m => m.id));
    groupMemberIds.add(id);

    const newMembers = groupMembers.filter(m => !originalParticipantIds.has(m.id));

    const removedMembers = selectedGroup.participants.filter(p => !groupMemberIds.has(p.id));

    try {
      const removeRes = await Promise.all(removedMembers.map(m => removeUserFromGroup(selectedGroup.id, m.id)));
      
      const addRes = await Promise.all(newMembers.map(m => addUserToGroup(selectedGroup.id, m.id)));
      
      const lastRemoveRes = removeRes.length > 0 ? removeRes[removeRes.length - 1] : null;
      const lastAddRes = addRes.length > 0 ? addRes[addRes.length - 1] : null;
      
      const res = lastAddRes ?? lastRemoveRes;
      
      if (res) {
        setGroups((prevGroups) => {
          const grps = [...prevGroups].filter(g => g.id !== selectedGroup.id);
          setSelectGroup && setSelectGroup({ id: res._id, username: res.name, participants: groupMembers, unreadMessageCount: 0 });
          return grps.concat({ id: res._id, username: res.name, participants: groupMembers, unreadMessageCount: 0 });
        });
      }
    } catch (error) {
      setErrorMessage("Failed to save changes, try again");
    } finally {
      setLoading(false);
    }
  };

  // const handleDeleteGroup = async (groupId: string) => {
  //   try {
  //     const res = await deleteGroup(groupId);
  //     if (res.success) {
  //       setSuccessMessage('Group deleted successfully.');
  //       setGroups((prevGroups) => prevGroups.filter((g) => g.id !== groupId));
  //     } else {
  //       setErrorMessage(res.message);
  //     }
  //   } catch (error) {
  //     setErrorMessage('Failed to delete group.');
  //   }
  // };

  const handleAddMember = (member: FriendRequest) => {
    setGroupMembers((prev) => sortByName([...prev, member]));
    setFriendsLocal((prev) => sortByName(prev.filter(friend => friend.id !== member.id)));
  };

  const handleRemoveMember = (member: FriendRequest) => {
    setGroupMembers((prev) => sortByName(prev.filter(friend => friend.id !== member.id)));
    setFriendsLocal((prev) => sortByName([...prev, member]));
  };

  const renderList = (type: "add" | "remove", title: string, items: FriendRequest[], onButtonClick: (member: FriendRequest) => void) => {
    return (
      <div className="mb-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md">
          <ul className="space-y-2">
            {items.map((friend) => (
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
                  onClick={() => onButtonClick(friend)}
                >
                  {type === "remove" ? <XIcon className="w-5 h-5 text-red-500 hover:text-red-700" /> : <PlusIcon className="w-5 h-5 text-green-500 hover:text-green-700" /> }
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-8 rounded-lg shadow-lg w-full max-w-lg"
      >
        <h2 className="text-2xl font-semibold mb-3">Group Management</h2>

        {/* Section for Creating Group */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter group name"
            className="input input-bordered w-full mb-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 rounded-md"
            value={groupNameInput}
            onChange={(e) => setGroupNameInput(e.target.value)}
          />
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
          {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
        </div>

        {/* Section for Adding/Removing Group Members */}
        <div className="mb-4">
          {renderList("remove", "Members", groupMembers, handleRemoveMember)}
          {renderList("add", "Friends List", friendsLocal, handleAddMember)}
        </div>
        
        <button
          className="btn btn-primary w-full"
          onClick={type === "create" ? handleCreateGroup : handleEditGroup}
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner"></span>}
          {type === "create" ? "Create" : "Save"}
        </button>
        <button
          className="btn btn-error mt-2 w-full"
          onClick={onClose}
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner"></span>}
          Close
        </button>
      </div>
    </div>
  );
};

export default GroupManagement;
