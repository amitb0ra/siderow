import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "redis";
import "dotenv/config";

interface SocketWithRoom extends Socket {
  roomId?: string;
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = 8080;

app.use(cors());
app.use(express.json());

const startServer = async () => {
  console.log("redis url", process.env.REDIS_URL);
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });
  redisClient.on("error", (err) => console.log("Redis Client Error", err));

  await redisClient.connect();
  console.log("Connected to Redis");

  app.post("/api/create-room", async (req, res) => {
    const roomId = uuidv4();

    await redisClient.sAdd("activeRooms", roomId);

    await redisClient.hSet(`room:${roomId}`, {
      videoUrl: "",
      currentTime: 0,
      isPlaying: "false",
    });

    console.log(`[REST] Room created: ${roomId}`);
    res.status(201).json({ roomId });
  });

  app.post("/api/join-room", async (req, res) => {
    const { roomId } = req.body;

    const roomExists = await redisClient.sIsMember("activeRooms", roomId);

    if (!roomId || !roomExists) {
      return res.status(404).json({ error: "Room not found" });
    }

    console.log(`[REST] User joining room: ${roomId}`);
    res.status(200).json({ success: true });
  });

  io.on("connection", (socket: SocketWithRoom) => {
    console.log(`[Socket.IO] User connected: ${socket.id}`);

    socket.on("room:join", async (roomId: string) => {
      const roomExists = await redisClient.sIsMember("activeRooms", roomId);
      if (!roomExists) {
        console.warn(`[Socket.IO] Invalid room join attempt: ${roomId}`);
        return;
      }

      socket.join(roomId);
      socket.roomId = roomId;
      console.log(`[Socket.IO] User ${socket.id} joined room ${roomId}`);

      const roomState = await redisClient.hGetAll(`room:${roomId}`);

      socket.emit("room:sync", {
        videoUrl: roomState.videoUrl || "",
        currentTime: parseFloat(roomState.currentTime || "0"),
        isPlaying: roomState.isPlaying === "true",
      });

      const chatHistory = await redisClient.lRange(`chat:${roomId}`, 0, -1);

      const messages = chatHistory.map((msg) => JSON.parse(msg)).reverse();

      socket.emit("chat:history", messages);
    });

    socket.on("video:change", async (data: { roomId: string; url: string }) => {
      await redisClient.hSet(`room:${data.roomId}`, {
        videoUrl: data.url,
        currentTime: 0,
        isPlaying: "false",
      });

      const roomState = await redisClient.hGetAll(`room:${data.roomId}`);
      const stateToEmit = {
        videoUrl: roomState.videoUrl || "",
        currentTime: parseFloat(roomState.currentTime || "0"),
        isPlaying: roomState.isPlaying === "true",
      };

      io.to(data.roomId).emit("video:changed", stateToEmit);
    });

    socket.on("video:play", async (data: { roomId: string; time: number }) => {
      await redisClient.hSet(`room:${data.roomId}`, {
        isPlaying: "true",
        currentTime: data.time.toString(),
      });
      socket.to(data.roomId).emit("video:played", { time: data.time });
    });

    socket.on("video:pause", async (data: { roomId: string; time: number }) => {
      await redisClient.hSet(`room:${data.roomId}`, {
        isPlaying: "false",
        currentTime: data.time.toString(),
      });
      socket.to(data.roomId).emit("video:paused", { time: data.time });
    });

    socket.on("video:seek", async (data: { roomId: string; time: number }) => {
      await redisClient.hSet(
        `room:${data.roomId}`,
        "currentTime",
        data.time.toString()
      );
      socket.to(data.roomId).emit("video:seeked", { time: data.time });
    });

    socket.on(
      "chat:send",
      async (data: { roomId: string; message: string; userName: string }) => {
        const message = {
          id: `${socket.id}-${Date.now()}`,
          text: data.message,
          user: data.userName,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar: data.userName[0]?.toUpperCase() || "G",
          isSystem: false,
        };

        await redisClient.rPush(`chat:${data.roomId}`, JSON.stringify(message));

        io.to(data.roomId).emit("chat:receive", message);
      }
    );

    socket.on("disconnect", async () => {
      console.log(`[Socket.IO] User disconnected: ${socket.id}`);
      const { roomId } = socket;

      if (roomId) {
        const sockets = await io.in(roomId).allSockets();
        if (sockets.size === 0) {
          console.log(`[Socket.IO] Cleaned up empty room: ${roomId}`);
          await redisClient.sRem("activeRooms", roomId); // Remove from active list
          await redisClient.del(`room:${roomId}`); // Delete video state
          await redisClient.del(`chat:${roomId}`); // Delete chat history
        }
      }
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  });
};
startServer();
