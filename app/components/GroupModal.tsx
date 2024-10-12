import Image from 'next/image';
import { XIcon } from '@heroicons/react/solid';
import defaultAvatar from './../assets/chatting.png';
import React, { useRef, useEffect, useState } from 'react';
import { createGroup, addUserToGroup, removeUserFromGroup } from '@/api/group';
import { useUserContext } from '@/context/UserContext';

interface GroupManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupManagement: React.FC<GroupManagementProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { id, groups, setGroups } = useUserContext();
  const [groupNameInput, setGroupNameInput] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
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

  // const handleCreateGroup = async () => {
  //   setErrorMessage(null);
  //   setSuccessMessage(null);
  //
  //   if (groupNameInput.trim() === '') {
  //     setErrorMessage('Group name cannot be empty.');
  //     return;
  //   }
  //
  //   try {
  //     const res = await createGroup(groupNameInput.trim());
  //     if (res.success) {
  //       setSuccessMessage('Group created successfully.');
  //       setGroups((prevGroups) => [...prevGroups, res.group]);
  //       setGroupNameInput('');
  //     } else {
  //       setErrorMessage(res.message);
  //     }
  //   } catch (error) {
  //     setErrorMessage('Failed to create group.');
  //   }
  // };

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

  // const handleAddMember = async (groupId: string, userId: string) => {
  //   try {
  //     const res = await addUserToGroup(groupId, userId);
  //     if (res.success) {
  //       setSuccessMessage('Member added successfully.');
  //     } else {
  //       setErrorMessage(res.message);
  //     }
  //   } catch (error) {
  //     setErrorMessage('Failed to add member.');
  //   }
  // };
  //
  // const handleRemoveMember = async (groupId: string, username: string) => {
  //   try {
  //     const res = await removeGroupMember(groupId, username);
  //     if (res.success) {
  //       setSuccessMessage('Member removed successfully.');
  //     } else {
  //       setErrorMessage(res.message);
  //     }
  //   } catch (error) {
  //     setErrorMessage('Failed to remove member.');
  //   }
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-8 rounded-lg shadow-lg w-full max-w-lg"
      >
        <h2 className="text-2xl font-semibold mb-6">Group Management</h2>

        {/* Section for Viewing Groups */}
        <div className="mb-6 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">Groups</h3>
          <ul className="space-y-2">
            {groups.map((group) => (
              <li
                key={group.id}
                className="p-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src={defaultAvatar}
                    alt={`${group.username} avatar`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{group.username}</span>
                </div>
                <button
                  className="text-red-500 hover:text-red-700"
                  //onClick={() => handleDeleteGroup(group.id)}
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Section for Creating Group */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Create New Group</h3>
          <input
            type="text"
            placeholder="Enter group name"
            className="input input-bordered w-full mb-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 rounded-md"
            value={groupNameInput}
            onChange={(e) => setGroupNameInput(e.target.value)}
          />
          <button
            className="btn btn-primary w-full"
            // onClick={handleCreateGroup}
          >
            Create Group
          </button>
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
          {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
        </div>

        {/* Section for Adding/Removing Group Members */}
        {selectedGroup && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Manage Members for {selectedGroup}</h3>
            {/* Add member input and actions could go here */}
          </div>
        )}

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

export default GroupManagement;
