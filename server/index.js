const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Store subscriptions in memory (temporary)
const userSubscriptions = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a topic
  socket.on("subscribe", (topic) => {
    if (!userSubscriptions[topic]) {
      userSubscriptions[topic] = [];
    }
    userSubscriptions[topic].push(socket.id);

    socket.join(topic);

    console.log(`User ${socket.id} subscribed to ${topic}`);
  });

  // Send message to topic
  socket.on("publish", ({ topic, message }) => {
    io.to(topic).emit("message", {
      topic,
      message,
    });
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