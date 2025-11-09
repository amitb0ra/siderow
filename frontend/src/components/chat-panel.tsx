"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Smile } from "lucide-react"

interface Message {
  id: string
  user: string
  text: string
  timestamp: string
  isSystem?: boolean
  avatar?: string
}

interface ChatPanelProps {
  userName: string
}

const EMOJI_LIST = ["😀", "😂", "😍", "🤔", "😎", "🔥", "👍", "❤️", "😢", "🎉", "🎬", "📺", "🍿", "🎭", "⭐"]

export function ChatPanel({ userName }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("watchparty_messages")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return [
            {
              id: "1",
              user: "System",
              text: "Sezal joined the room",
              timestamp: "17:17:13",
              isSystem: true,
            },
            {
              id: "2",
              user: "System",
              text: "CHANGED THE VIDEO TO Virtual Browser",
              timestamp: "17:17:13",
              isSystem: true,
            },
            {
              id: "3",
              user: "Alex",
              text: "Hey everyone!",
              timestamp: "17:18:45",
              avatar: "A",
            },
            {
              id: "4",
              user: "Jordan",
              text: "This movie is amazing",
              timestamp: "17:19:12",
              avatar: "J",
            },
          ]
        }
      }
    }
    return [
      {
        id: "1",
        user: "System",
        text: "Sezal joined the room",
        timestamp: "17:17:13",
        isSystem: true,
      },
      {
        id: "2",
        user: "System",
        text: "CHANGED THE VIDEO TO Virtual Browser",
        timestamp: "17:17:13",
        isSystem: true,
      },
      {
        id: "3",
        user: "Alex",
        text: "Hey everyone!",
        timestamp: "17:18:45",
        avatar: "A",
      },
      {
        id: "4",
        user: "Jordan",
        text: "This movie is amazing",
        timestamp: "17:19:12",
        avatar: "J",
      },
    ]
  })
  const [newMessage, setNewMessage] = useState("")
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem("watchparty_messages", JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        user: userName,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        avatar: userName[0].toUpperCase(),
      }
      setMessages([...messages, message])
      setNewMessage("")
      setShowEmojiPicker(false)

      if (Math.random() > 0.7) {
        const otherUsers = ["Alex", "Jordan", "Sezal"].filter((u) => u !== userName)
        const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)]
        setTypingUsers([randomUser])
        setTimeout(() => setTypingUsers([]), 2000)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage(newMessage + emoji)
    setShowEmojiPicker(false)
  }

  const getAvatarColor = (name: string) => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-green-500", "bg-orange-500"]
    const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1)
    return colors[hash % colors.length]
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              {msg.isSystem ? (
                <div className="text-xs text-muted-foreground italic text-center py-2">{msg.text}</div>
              ) : (
                <div className="flex gap-2">
                  <div
                    className={`w-8 h-8 rounded-full ${getAvatarColor(msg.user)} text-white flex items-center justify-center text-xs font-semibold flex-shrink-0`}
                  >
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-primary">{msg.user}</span>
                      <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <p className="text-foreground mt-1 break-words">{msg.text}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {typingUsers.length > 0 && (
            <div className="flex gap-2 items-center text-xs text-muted-foreground italic">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></span>
                <span
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></span>
              </div>
              <span>
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
              </span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <div className="relative">
          <div className="flex items-center gap-2 bg-background border border-input rounded-md px-3 py-2">
            <Input
              placeholder="Enter a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-sm border-0 bg-transparent p-0 focus-visible:ring-0 flex-1"
            />

            {/* Emoji Picker Button */}
            <div className="relative" ref={emojiPickerRef}>
              <Button
                size="sm"
                variant="ghost"
                className="px-2 h-auto"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Add emoji"
              >
                <Smile className="w-4 h-4" />
              </Button>

              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 bg-background border border-border rounded-md p-2 shadow-lg z-50 w-48">
                  <div className="grid grid-cols-5 gap-1">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addEmoji(emoji)}
                        className="p-2 hover:bg-muted rounded text-lg transition-colors"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button onClick={sendMessage} size="sm" variant="ghost" className="px-2 h-auto" title="Send message">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
