"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [topic, setTopic] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost", {
      path: "/socket.io",
      transports: ["websocket"],
      // upgrade: false,
    });

    newSocket.on("connect", () => {
      setConnected(true);
      console.log("Connected:", newSocket.id);
    });

    newSocket.on("message", (data) => {
      console.log("Message received from:", data.from);
      setMessages((prev) => [...prev, data.message]);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const subscribe = () => {
    if (!socket || !topic) return;
    socket.emit("subscribe", topic.trim().toLowerCase());
  };

  const sendMessage = () => {
    if (!socket || !topic) return;

    socket.emit("publish", {
      topic: topic.trim().toLowerCase(),
      message: "Hello from client at " + new Date().toLocaleTimeString(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h1 className="text-2xl text-gray-700 font-bold mb-4 text-center">Realtime System</h1>

        <div className="mb-4 text-center text-gray-700 text-sm">
          Status:{" "}
          <span className={connected ? "text-green-600" : "text-red-600"}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <input
          className="w-full border  p-2 rounded mb-3 text-black"
          placeholder="Enter topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div className="flex gap-2 mb-4">
          <button
            onClick={subscribe}
            className="flex-1 bg-blue-500 text-white py-2 rounded"
          >
            Subscribe
          </button>

          <button
            onClick={sendMessage}
            className="flex-1 bg-green-500 text-white py-2 rounded"
          >
            Send
          </button>
        </div>

        <div className="bg-gray-50 p-3 rounded h-40 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">No messages yet</p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="bg-white text-gray-600 p-2 mb-2 rounded text-sm">
                {msg}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
