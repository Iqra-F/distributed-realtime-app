"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [topic, setTopic] = useState("");

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("message", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    return () => newSocket.disconnect();
  }, []);

  const subscribe = () => {
    socket.emit("subscribe", topic.trim().toLowerCase());
  };

  const sendMessage = () => {
    socket.emit("publish", {
      topic: topic.trim().toLowerCase(),
      message: "Hello, you have subscribed to this topic. Thanks.",
    });
  };

  return (
    <div className="p-10">
      <input
        className="border p-2 mr-2"
        placeholder="Enter topic"
        onChange={(e) => setTopic(e.target.value)}
      />
      <button onClick={subscribe} className="bg-blue-500 text-white p-2 mr-2">
        Subscribe
      </button>
      <button onClick={sendMessage} className="bg-green-500 text-white p-2">
        Send Message
      </button>

      <div className="mt-5">
        <h2>Messages:</h2>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
    </div>
  );
}