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

// 🔴 Redis setup
const pub = new Redis({
  host: "redis", // docker service name
  port: 6379,
});

const sub = new Redis({
  host: "redis",
  port: 6379,
});

// 🔴 Listen to Redis messages
sub.subscribe("MESSAGES");

sub.on("message", (channel, message) => {
  const data = JSON.parse(message);

  // Emit to all users in that topic (room)
  io.to(data.topic).emit("message", data);
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join topic
  socket.on("subscribe", (topic) => {
    socket.join(topic);
    console.log(`User ${socket.id} subscribed to ${topic}`);
  });

  // Publish message via Redis
  socket.on("publish", ({ topic, message }) => {
    pub.publish(
      "MESSAGES",
      JSON.stringify({ topic, message })
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Realtime server running");
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});