"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, LogIn, Zap, Users, Clock, Star } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Room {
  id: string;
  name: string;
  viewers: number;
  currentMovie?: string;
}

interface RoomListProps {
  userName: string;
  onSelectRoom: (roomId: string) => void;
}

export default function RoomList({ userName, onSelectRoom }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Create a new room
  const handleCreateRoom = async () => {
    try {
      setIsCreating(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      const response = await axios.post(
        "http://localhost:8080/api/create-room"
      );
      const { roomId } = response.data;
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create a room. Please try again.");
    }
    setIsCreating(false);
    if (newRoomName.trim()) {
      const newRoom: Room = {
        id: Date.now().toString(),
        name: newRoomName,
        viewers: 1,
      };
      setRooms([...rooms, newRoom]);
      setNewRoomName("");
      onSelectRoom(newRoom.id);
    }
  };

  // Join an existing room
  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a valid room code");
      return;
    }

    try {
      setIsJoining(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const response = await axios.post("http://localhost:8080/api/join-room", {
        roomId: joinCode.trim(),
      });

      if (response.status === 200) {
        router.push(`/room/${joinCode.trim()}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Room not found or unavailable.");
    }
    setJoinRoomId("");
    setIsJoining(false);
  };

  const deleteRoom = (roomId: string) => {
    setRooms(rooms.filter((room) => room.id !== roomId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Welcome */}
        <div className="mb-12 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              WatchParty
            </h1>
          </div>
          <p className="text-xl text-foreground font-medium">
            Welcome back, {userName}!
          </p>
          <p className="text-muted-foreground">
            Ready to watch something amazing together?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Create Room Card */}
          <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-border hover:border-primary/50 transition-all hover:shadow-lg flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Create Room
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Instant room ID generated
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Start a new watch party and share the room ID with your friends.
                They can join instantly!
              </p>

              <div className="bg-muted/50 p-4 rounded-lg my-4 border border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Quick setup - No account needed</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Unlimited participants</span>
                </div>
              </div>

              <Button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full gap-2 h-11 font-semibold text-base mt-auto"
              >
                {isCreating && (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                )}
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </Card>

          {/* Join Room Card */}
          <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-border hover:border-primary/50 transition-all hover:shadow-lg flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <LogIn className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Join Room
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use a room ID to join
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Have a room ID? Paste it here to join your friends' watch party
                and start watching together!
              </p>

              <div className="bg-muted/50 p-4 rounded-lg my-4 border border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Star className="w-4 h-4" />
                  <span>Dynamic room generation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4" />
                  <span>Instant connection</span>
                </div>
              </div>

              <div className="space-y-3 mt-auto">
                <Input
                  placeholder="Enter room ID..."
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !isJoining && handleJoinRoom()
                  }
                  disabled={isJoining}
                  className="text-base font-mono"
                />
                <Button
                  onClick={handleJoinRoom}
                  disabled={isJoining}
                  className="w-full gap-2 h-11 font-semibold text-base"
                >
                  {isJoining && (
                    <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                  )}
                  {isJoining ? "Joining..." : "Join Room"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg mt-1">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Watch Together
                </h3>
                <p className="text-sm text-muted-foreground">
                  Share rooms with friends and sync playback in real-time
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg mt-1">
                <Plus className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Chat Live
                </h3>
                <p className="text-sm text-muted-foreground">
                  Send messages and react with emojis while watching
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg mt-1">
                <Star className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Browse Together
                </h3>
                <p className="text-sm text-muted-foreground">
                  Use the virtual browser to surf the web together
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
