"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  // Create a new room
  const handleCreateRoom = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/create-room");
      const { roomId } = response.data;
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create a room. Please try again.");
    }
  };

  // Join an existing room
  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a valid room code");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/join-room", {
        roomId: joinCode.trim(),
      });

      if (response.status === 200) {
        router.push(`/room/${joinCode.trim()}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Room not found or unavailable.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-6">
      <h1 className="text-5xl font-bold mb-8 text-center">Watch Party 🎉</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* Create Room */}
        <button
          onClick={handleCreateRoom}
          className="px-6 py-3 font-semibold text-lg bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Create a New Room
        </button>

        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="border-t border-gray-600 w-20"></div>
          <span className="text-gray-400 text-sm">or</span>
          <div className="border-t border-gray-600 w-20"></div>
        </div>

        {/* Join Room */}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter Room Code"
            className="flex-1 px-4 py-2 text-white rounded-md border"
          />
          <button
            onClick={handleJoinRoom}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-md font-semibold"
          >
            Join
          </button>
        </div>
      </div>
    </main>
  );
}
