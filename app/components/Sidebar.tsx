import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUserContext } from "../context/UserContext";
import defaultAvatar from "../assets/chatting.png";
import { Friend, Group } from "@/types/types";
import { PlusIcon } from '@heroicons/react/solid';
import GroupManagement from "./GroupModal";

interface SidebarProps {
  onSelectChat: (chatId: Friend | null) => void,
  onSelectGroup: (group: Group | null) => void
}

function Sidebar({ onSelectChat, onSelectGroup }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'groups'>('chats');
  const [open, setOpen] = useState(false);
  const { friends, groups, error } = useUserContext();
  const [chats, setChats] = useState<any[]>([]); // Replace with actual type if available

  const handleTabChange = async (tab: 'chats' | 'groups') => {
    setActiveTab(tab);
    if (tab === 'chats') {
      onSelectGroup(null);
      // Fetch and display chats
      // For example purposes, assuming you have a method to get chats
      // const chatRes = await getChats();
      // if (chatRes.success) {
      //   setChats(chatRes.chats || []);
      // } else {
      //   console.error(chatRes.message);
      // }
    } else if (tab === 'groups') {
      // Display groups
      onSelectChat(null);
    }
  };

  useEffect(() => {
    renderList();
  }, [friends, groups]);

  const renderList = () => {
    if (activeTab === 'chats') {
      return friends.map((item, index) => (
        <div
          key={index}
          className="flex items-center p-2 cursor-pointer hover:bg-base-300 rounded-lg"
          onClick={() => onSelectChat(item)}
        >
          <Image
            src={defaultAvatar}
            alt={`${item.username}'s avatar`}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{item.username}</span>
            </div>
          </div>
        </div>
      ));
    } else if (activeTab === 'groups') {
      return groups.map((item, index) => (
        <div>
          <div
            key={index}
            className="flex items-center p-2 cursor-pointer hover:bg-base-300 rounded-lg"
            onClick={() => onSelectGroup(item)}
          >
            <Image
              src={defaultAvatar}
              alt={`${item.username}'s avatar`}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.username}</span>
              </div>
            </div>
          </div>
        </div>
      ));
    }
  };

  return (
    <div className="w-80 bg-base-200 p-4 border-r border-base-300">
      <div className="flex mb-4 border-b border-base-300">
        <button
          className={`flex-1 py-2 text-center font-semibold ${activeTab === 'chats' ? 'bg-base-300' : 'text-gray-500'}`}
          onClick={() => handleTabChange('chats')}
        >
          Chats
        </button>
        <button
          className={`flex-1 py-2 text-center font-semibold ${activeTab === 'groups' ? 'bg-base-300' : 'text-gray-500'}`}
          onClick={() => handleTabChange('groups')}
        >
          Groups
        </button>
      </div>

      <div className="space-y-2">
        {error && <p className="text-red-500">{error}</p>}
        {activeTab === "groups" && 
          <div
            className="flex items-center p-2 cursor-pointer gap"
            onClick={() => setOpen(true)}
          >
            <PlusIcon className="w-6 h-6 text-green-500 mr-1" />

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-green-500">Create New Group</span>
              </div>
            </div>
          </div>
        }
        {renderList()}
      </div>

      <GroupManagement type="create" isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default Sidebar;
