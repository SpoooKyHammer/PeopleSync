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
import { getGroupMessages } from "@/api/group";

interface ChatAreaProps {
  selectedChat?: Friend,
  selectedGroup?: Group,
  setSelectedGroup?: (group: Group | null) => void
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

export default function ChatArea({ selectedChat, selectedGroup, setSelectedGroup }: ChatAreaProps) {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const { username, id } = useUserContext();
  const [openGroupManagement, setOpenGroupManagement] = useState(false);
  const [groupMembers, setGroupMembers] = useState<Friend[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  };

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessage = async () => {
    if (selectedChat) {
      const res = await getMessages(selectedChat.chatId);
      setMessages(res.messages);
    } else if (selectedGroup) {
      const res = await getGroupMessages(selectedGroup.id);
      setMessages(res.messages);
    }
  }

  useEffect(() => {
    fetchMessage();
  }, [selectedChat, selectedGroup])

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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleEmojiClick = (emoji: any) => {
    setMessage((prevMessage) => prevMessage + emoji.emoji);
  };

  return (
    <div className="flex flex-col h-full bg-base-100 relative">
      <div className="flex-1 overflow-y-auto p-4 mb-20 pt-16">
        <div className="mb-4 flex items-center gap-2 absolute top-0 left-0 right-0 bg-base-100 p-4 z-10">
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
            className={`chat ${msg.sender._id === id ? 'chat-end' : 'chat-start'}`}
          >
            {selectedGroup && msg.sender._id !== id &&
              <div className="chat-header opacity-50">
                {msg.sender.username}
              </div>
            }
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
              <Image src={appIcon} alt="User Avatar" />
              </div>
            </div>
            <div className={`chat-bubble max-w-xl whitespace-normal break-words ${msg.sender.username === username ? 'chat-bubble-primary' : ''}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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
        <textarea
          ref={textareaRef}
          className="flex-1 border rounded-lg px-4 py-2 text-sm resize-y min-h-[40px] max-h-32"
          rows={1}
          value={message}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button
          className="bg-primary text-white rounded-lg px-4 py-2"
          onClick={handleSend}
        >
          Send
        </button>
        <button className="text-xl">📎</button>
      </div>

      <GroupManagement type="edit" selectedGroup={selectedGroup} setSelectGroup={setSelectedGroup} isOpen={openGroupManagement} onClose={() => setOpenGroupManagement(false)} />
    </div>
  );
}
