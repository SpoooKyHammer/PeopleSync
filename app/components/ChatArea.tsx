"use client";
import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import Image from "next/image";

import appIcon from "./../assets/chatting.png";

interface ChatAreaProps {
  selectedChatId: string | null;
}

export default function ChatArea({ selectedChatId }: ChatAreaProps) {
  const [message, setMessage] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    // Add logic to send the message
    console.log("Sending message:", message);
    setMessage("");
  };

  const handleEmojiClick = (emoji: any) => {
    setMessage((prevMessage) => prevMessage + emoji.emoji);
  };

  const dummyMessages = {
    chat1: [
      { id: '1', text: 'Hello! How are you?', sender: 'Alice', timestamp: '10:00 AM' },
      { id: '2', text: 'I am good, thanks! How about you?', sender: 'You', timestamp: '10:05 AM' },
    ],
    chat2: [
      { id: '1', text: 'Let\'s meet up later.', sender: 'Bob', timestamp: '02:30 PM' },
    ],
    group1: [
      { id: '1', text: 'New project details!', sender: 'Admin', timestamp: '11:00 AM' },
    ],
    group2: [
      { id: '1', text: 'Feedback on the new design.', sender: 'Admin', timestamp: '09:30 AM' },
    ],
  };

  const messages = selectedChatId ? dummyMessages[selectedChatId] || [] : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full bg-base-100 relative">
      <div className="flex-1 overflow-y-auto p-4 mb-20">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Chat {selectedChatId}</h1>
        </div>
        {/* Display messages */}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-${msg.sender === 'You' ? 'end' : 'start'} mb-4 ${msg.sender === 'You' ? 'justify-end' : ''}`}
          >
            {msg.sender !== 'You' && (
              <Image src={appIcon} alt="User Avatar" width={40} height={40} className="rounded-full" />
            )}
            <div className={`ml-3 ${msg.sender === 'You' ? 'bg-primary text-white' : 'bg-base-200'} p-2 rounded-lg max-w-[75%] sm:max-w-[60%]`}>
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs text-gray-500">{msg.timestamp}</span>
            </div>
            {msg.sender === 'You' && (
              <Image src={appIcon} alt="Your Avatar" width={40} height={40} className="rounded-full" />
            )}
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
    </div>
  );
}
