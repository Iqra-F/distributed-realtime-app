const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const Redis = require("ioredis");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔴 Redis connections
const pub = new Redis({
  host: "redis", // docker service name
  port: 6379,
});

const sub = new Redis({
  host: "redis",
  port: 6379,
});

// 🔴 Track which topics THIS server already subscribed to
const subscribedTopics = new Set();

// 🔴 Listen to Redis messages (global, runs once)
sub.on("message", (channel, message) => {
  const data = JSON.parse(message);

  // channel === topic
  io.to(channel).emit("message", data);
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🟢 Subscribe user to topic
  socket.on("subscribe", (topic) => {
    const cleanTopic = topic.trim().toLowerCase();

    socket.join(cleanTopic);

    // Subscribe to Redis channel ONLY ONCE per topic
    if (!subscribedTopics.has(cleanTopic)) {
      sub.subscribe(cleanTopic);
      subscribedTopics.add(cleanTopic);
      console.log(`Subscribed to Redis channel: ${cleanTopic}`);
    }

    console.log(`User ${socket.id} subscribed to ${cleanTopic}`);
  });

  // 🟠 Publish message via Redis
  socket.on("publish", ({ topic, message }) => {
    const cleanTopic = topic.trim().toLowerCase();

    pub.publish(
      cleanTopic,
      JSON.stringify({
        topic: cleanTopic,
        message,
      })
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Simple health route
app.get("/", (req, res) => {
  res.send("Realtime server running");
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});