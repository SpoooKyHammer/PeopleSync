import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import Image from "next/image";
import { useUserContext } from "../context/UserContext";
import appIcon from "../assets/chatting.png";
import { Friend, Group } from "@/types/types";
import { getMessages } from "@/api/chat";
import { sendMessage } from "@/api/message";
import defaultAvatar from "../assets/chatting.png";
import { PencilIcon } from "@heroicons/react/solid";
import GroupManagement from "./GroupModal";

interface ChatAreaProps {
  selectedChat?: Friend,
  selectedGroup?: Group
}

interface Message {
    _id: string,
    sender: {
      _id: string,
      username: string
    },
    content: string,
    timestamp: Date
}

export default function ChatArea({ selectedChat, selectedGroup }: ChatAreaProps) {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const { username } = useUserContext();
  const [openGroupManagement, setOpenGroupManagement] = useState(false);
  const [groupMembers, setGroupMembers] = useState<Friend[]>([]);

  const fetchMessage = async () => {
    if (selectedChat) {
      const res = await getMessages(selectedChat.chatId);
      setMessages(res.messages);
    } else if (selectedGroup) {
      const res = "get group messages and display them here";
      // setMessages(res.messages);
    }
  }

  useEffect(() => {
    fetchMessage();
  }, [selectedChat, selectedGroup])

  // Dummy data, replace with real data from API
  // const dummyMessages = {
  //   chat1: [
  //     { id: '1', text: 'Hello! How are you?', sender: 'Alice', timestamp: '10:00 AM' },
  //     { id: '2', text: 'I am good, thanks! How about you?', sender: 'You', timestamp: '10:05 AM' },
  //   ],
  //   chat2: [
  //     { id: '1', text: 'Let\'s meet up later.', sender: 'Bob', timestamp: '02:30 PM' },
  //   ],
  //   group1: [
  //     { id: '1', text: 'New project details!', sender: 'Admin', timestamp: '11:00 AM' },
  //   ],
  //   group2: [
  //     { id: '1', text: 'Feedback on the new design.', sender: 'Admin', timestamp: '09:30 AM' },
  //   ],
  // };
  //
  // const messages = selectedChatId ? dummyMessages[selectedChatId] || [] : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async () => {
    if (selectedChat) await sendMessage({ content: message, chat: selectedChat.chatId });
    else if (selectedGroup) await sendMessage({ content: message, group: selectedGroup.id });

    await fetchMessage();
    setMessage("");
  };

  const handleEmojiClick = (emoji: any) => {
    setMessage((prevMessage) => prevMessage + emoji.emoji);
  };

  return (
    <div className="flex flex-col h-full bg-base-100 relative">
      <div className="flex-1 overflow-y-auto p-4 mb-20">
        <div className="mb-4 flex items-center gap-2">
          <Image
            src={defaultAvatar}
            alt={`avatar`}
            className="w-8 h-8 rounded-full object-cover mr-3"
          />
          <h1 className="text-xl font-bold">Chat with {selectedChat ? selectedChat.username : selectedGroup ? selectedGroup.username : ""}</h1>
          {selectedGroup &&
            <button type="button" onClick={() => setOpenGroupManagement(true)}>
              <PencilIcon className="w-6 h-6 text-blue-500 mr-1" />
            </button>
          }
        </div>
        {messages.map(msg => (
          <div
            key={msg._id}
            className={`chat ${msg.sender.username === username ? 'chat-end' : 'chat-start'}`}
          >
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
              <Image src={appIcon} alt="User Avatar" />
              </div>
            </div>
            <div className={`chat-bubble ${msg.sender.username === username ? 'chat-bubble-primary' : ''}`}>{msg.content}</div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 flex items-center p-2 space-x-2">
        <button
          className="text-xl p-2"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          😀
        </button>
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-12 left-4 z-10"
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        <input
          type="text"
          className="flex-1 border rounded-lg px-4 py-2 text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="bg-primary text-white rounded-lg px-4 py-2"
          onClick={handleSend}
        >
          Send
        </button>
        <button className="text-xl">📎</button>
      </div>

      <GroupManagement type="edit" selectedGroup={selectedGroup} isOpen={openGroupManagement} onClose={() => setOpenGroupManagement(false)} />
    </div>
  );
}
