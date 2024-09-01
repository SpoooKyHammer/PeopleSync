"use client";

import React, { useState } from "react";
import Spinner from "@/components/Spinner";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { loading } = useAuth();
  
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          onSelectChat={setSelectedChatId}
        />
        <div className={`flex-1 overflow-auto bg-base-100 p-4 transition-transform`}>
          {selectedChatId ? (
            <ChatArea selectedChatId={selectedChatId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
