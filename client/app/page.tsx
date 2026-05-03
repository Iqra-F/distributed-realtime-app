"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [topic, setTopic] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");

    newSocket.on("connect", () => {
      setConnected(true);
      console.log("Connected:", newSocket.id);
    });

    newSocket.on("message", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const subscribe = () => {
    if (!topic) return;
    socket.emit("subscribe", topic.trim().toLowerCase());
  };

  const sendMessage = () => {
    socket.emit("publish", {
      topic: topic.trim().toLowerCase(),
      message: "Hello from client at " + new Date().toLocaleTimeString(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h1 className="text-2xl text-amber-800 font-bold mb-4 text-center">
          Realtime System
        </h1>

        <div className="mb-4 text-gray-600 text-sm text-center">
          Status:{" "}
          <span className={connected ? "text-green-600" : "text-red-600"}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <input
          className="w-full border p-2 placeholder-gray-400 text-black rounded mb-3"
          placeholder="Enter topic (e.g. news)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div className="flex gap-2 mb-4">
          <button
            onClick={subscribe}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          >
            Subscribe
          </button>
          <button
            onClick={sendMessage}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
          >
            Send
          </button>
        </div>

        <div className="bg-gray-50 p-3 rounded h-40 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">
              No messages yet
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className="bg-white text-gray-700 shadow-sm p-2 mb-2 rounded text-sm"
              >
                {msg}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}