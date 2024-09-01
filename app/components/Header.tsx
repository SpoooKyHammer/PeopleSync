"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import appIcon from "./../assets/chit-chat.png";
import FriendModal from "./FriendModel";
import { setAuthToken } from "@/config/api";

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = () => {
    setAuthToken(null);
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <header className="bg-base-100 shadow-lg border-b border-base-200">
      <div className="container mx-auto flex justify-between items-center p-4 sm:p-6">
        <div className="flex items-center space-x-4">
          <Image
            src={appIcon}
            alt="App Icon"
            width={40}
            height={40}
            className="rounded-full"
          />
          <h1 className="text-4xl font-bold text-primary hidden sm:block">PeopleSync</h1>
          <h1 className="text-2xl font-bold text-primary sm:hidden">PeopleSync</h1>
        </div>
        <div className="relative" ref={menuRef}>
          {/* 3-Dot Menu Icon for Small Screens */}
          <div
            className="sm:hidden flex items-center cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <svg
              className="w-6 h-6 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <circle cx="12" cy="6" r="2.5" />
              <circle cx="12" cy="12" r="2.5" />
              <circle cx="12" cy="18" r="2.5" />
            </svg>
          </div>
          {/* More Button for Larger Screens */}
          <button
            className="btn btn-primary hidden sm:flex items-center space-x-2"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <span className="text-lg font-medium">More</span>
            <svg
              className={`w-5 h-5 transition-transform ${isProfileOpen ? 'rotate-180' : 'rotate-0'}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-base-100 border border-base-200 rounded-lg shadow-lg z-20">
              <button
                className="w-full text-left px-4 py-2 text-lg font-semibold text-gray-700 hover:bg-base-200 hover:text-primary transition-colors"
                onClick={() => setIsFriendModalOpen(true)}
              >
                Friends
              </button>
              <button
                className="w-full text-left px-4 py-2 text-lg font-semibold text-gray-700 hover:bg-base-200 hover:text-primary transition-colors"
                onClick={() => router.push("/profile")}
              >
                View Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-lg font-semibold text-white bg-error rounded-b-lg hover:bg-red-700 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Friend Modal */}
      <FriendModal
        isOpen={isFriendModalOpen}
        onClose={() => setIsFriendModalOpen(false)}
      />
    </header>
  );
}
