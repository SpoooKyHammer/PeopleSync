import React, { useState } from "react";
import Image from "next/image";
import appIcon from "./../assets/chatting.png";

interface SidebarProps {
  onSelectChat: (chatId: string) => void;
}

const chats = [
  { id: 'chat1', name: 'Alice', lastMessage: 'Hey, how are you?', timestamp: '2024-08-23T10:00:00Z', unread: 2, avatar: appIcon },
  { id: 'chat2', name: 'Bob', lastMessage: 'Let\'s meet up later.', timestamp: '2024-08-22T16:30:00Z', unread: 0, avatar: appIcon },
];

const groups = [
  { id: 'group1', name: 'Developers', lastMessage: 'New project details!', timestamp: '2024-08-21T14:00:00Z', unread: 3, avatar: appIcon },
  { id: 'group2', name: 'Designers', lastMessage: 'Feedback on the new design.', timestamp: '2024-08-20T09:15:00Z', unread: 1, avatar: appIcon },
];

function Sidebar({ onSelectChat }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'groups'>('chats');

  const handleTabChange = (tab: 'chats' | 'groups') => {
    setActiveTab(tab);
  };

  const renderList = () => {
    const data = activeTab === 'chats' ? chats : groups;

    return data.map((item) => (
      <div
        key={item.id}
        className="flex items-center p-2 cursor-pointer hover:bg-base-300 rounded-lg"
        onClick={() => onSelectChat(item.id)}
      >
        <Image
          src={item.avatar}
          alt={`${item.name}'s avatar`}
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{item.name}</span>
            {item.unread > 0 && (
              <span className="bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
                {item.unread}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{item.lastMessage}</p>
        </div>
      </div>
    ));
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
        {renderList()}
      </div>
    </div>
  );
}

export default Sidebar;
