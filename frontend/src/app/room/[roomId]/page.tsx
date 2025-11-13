"use client";

import { useEffect, useState, FormEvent, useRef, use } from "react";
import { socket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatPanel } from "@/components/chat-panel";
import { UserPanel } from "@/components/user-panel";
import { HomeIcon, Share2, X } from "lucide-react";
import React from "react";
import ReactPlayer from "react-player";

interface Message {
  id: string;
  text: string;
}

interface WatchRoomProps {
  roomId: string;
  userName: string;
  onLeave: () => void;
  onUserNameChange?: (name: string) => void;
}

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const [userName, setUserName] = useState<string>("Guest");
  const onLeave = () => {
    // default behavior: navigate back to previous page
    if (typeof window !== "undefined") window.history.back();
  };
  const onUserNameChange = (name?: string) => {
    if (name) setUserName(name);
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("https://www.google.com");
  const [quality, setQuality] = useState("720p");
  const [resolution, setResolution] = useState("Standard");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleInvite = () => {
    const inviteLink = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    setShowInviteModal(false);
  };

  // removed erroneous duplicate roomId extraction (roomId comes from props)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // Player state
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=LXb3EKWsInQ"
  ); // A default video
  const [inputUrl, setInputUrl] = useState("");
  // player playback uses the top-level isPlaying state declared above
  const playerRef = useRef(null);

  // --- Event Handlers ---

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit("sendMessage", { roomId, message: input });
      setInput("");
    }
  };

  const handleUrlChange = (e: FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      socket.emit("changeVideo", { roomId, url: inputUrl });
    }
  };

  const handlePlay = () => {
    const currentTime = 0;
    socket.emit("update-state", {
      roomId,
      videoUrl,
      currentTime,
      isPlaying: true,
    });
    setIsPlaying(true);
  };

  const handlePause = () => {
    const currentTime = 0;
    socket.emit("update-state", {
      roomId,
      videoUrl,
      currentTime,
      isPlaying: false,
    });
    setIsPlaying(false);
  };

  const handleSeek = (seconds: number) => {
    socket.emit("seek", { roomId, time: seconds });
  };

  // --- Socket Listeners ---

  useEffect(() => {
    socket.connect();
    socket.emit("joinRoom", roomId);

    // Chat listeners
    socket.on("receiveMessage", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // Player listeners
    socket.on("videoChanged", (newUrl: string) => {
      setVideoUrl(newUrl);
      setInputUrl(newUrl);
    });

    socket.on("playerStateUpdated", (playing: boolean) => {
      setIsPlaying(playing);
    });

    socket.on("seekToTime", (time: number) => {
      // playerRef.current?.seekTo(time, "seconds");
    });

    socket.on("sync-state", (state) => {
      console.log("🔄 Syncing with room:", state);
      setVideoUrl(state.videoUrl || videoUrl);
      setIsPlaying(state.isPlaying);
      if (playerRef.current) {
        // playerRef.current.seekTo(state.currentTime || 0, "seconds");
      }
    });

    socket.on("state-updated", (state) => {
      console.log("🛰 Updated room state:", state);
      setIsPlaying(state.isPlaying);
      if (playerRef.current) {
        // playerRef.current.seekTo(state.currentTime || 0, "seconds");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">WatchParty</h1>
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Room: {roomId}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Invite Friends
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLeave}
              className="gap-2 text-destructive hover:text-destructive bg-transparent"
            >
              <X className="w-4 h-4" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Invite Friends
            </h2>
            <p className="text-sm text-muted-foreground">
              Share this link with your friends to invite them to the room
            </p>
            <div className="bg-muted p-3 rounded border border-border text-sm text-foreground break-all">
              {`${window.location.origin}?room=${roomId}`}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInvite} className="flex-1">
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowInviteModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Browser */}
        <div className="flex-1 flex flex-col border-r border-border">
          {/* Browser Controls */}
          <div className="bg-card border-b border-border p-4 space-y-3">
            <div className="flex gap-2 flex-wrap items-center">
              <form onSubmit={handleUrlChange} className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Enter YouTube URL..."
                  className="flex-1 px-3 py-2 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button type="submit" className="bg-green-500">
                  Load Video
                </Button>
              </form>
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1 overflow-auto bg-background">
            <ReactPlayer
              ref={playerRef}
              width="100%"
              height="100%"
              src={videoUrl}
              controls={true}
              playing={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              // onSeek={handleSeek}
            />
          </div>

          {/* Playback Controls */}
          <div className="bg-card border-t border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                ⏮
              </Button>
              <Button size="sm" variant="outline">
                {isPlaying ? "⏸" : "▶"}
              </Button>
              <Button size="sm" variant="outline">
                ⏭
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                00:32 / 02:15:00
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                className="w-24"
              />
              <Button size="sm" variant="outline">
                ⛶
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Chat & Users */}
        <div className="w-80 flex flex-col border-l border-border bg-card">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              <ChatPanel userName={userName} />
            </TabsContent>

            <TabsContent value="people" className="flex-1 flex flex-col">
              <UserPanel
                userName={userName}
                onUserNameChange={onUserNameChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
