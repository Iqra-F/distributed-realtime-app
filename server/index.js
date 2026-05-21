const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const os = require("os");
const { createAdapter } = require("@socket.io/redis-adapter");
const socketAuth = require("./middlewares/socketAuth");
const { log } = require("/shared/logger");
const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost",
    methods: ["GET", "POST"],
    credentials: true,
  },
  // transports: ["websocket"],
});

// =====================
// Redis setup (ONLY for adapter)
// =====================
const pubClient = new Redis({
  host: "redis",
  port: 6379,
});

const subClient = pubClient.duplicate();

// IMPORTANT: wait for Redis before attaching adapter
// Promise.all([
//   pubClient.connect?.(),
//   subClient.connect?.(),
// ]).catch(() => {});

// Attach adapter (THIS is the core scaling layer)
io.adapter(createAdapter(pubClient, subClient));

// =====================
// Socket logic
// =====================
const instanceId = os.hostname();

io.use(socketAuth);
io.on("connection", (socket) => {
  log("User connected", { socketId: socket.id, instanceId, user: socket.user });
  socket.on("subscribe", (topic) => {
    const room = topic.trim().toLowerCase();
    socket.join(room);
    log("User subscribed to topic", { socketId: socket.id, topic: room });
  });

  socket.on("publish", ({ topic, message }) => {
    const room = topic.trim().toLowerCase();

    // Broadcast to ALL servers automatically via Redis adapter
    io.to(room).emit("message", {
      topic: room,
      message,
      from: instanceId,
    });
  });

  socket.on("disconnect", () => {
    log("User disconnected", { socketId: socket.id, instanceId });
  });
});

// Health check
app.get("/", (req, res) => {
  res.send("Realtime server running");
});

server.listen(5000, () => {
  log("Server started", { instanceId });
});