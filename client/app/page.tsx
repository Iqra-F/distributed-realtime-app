"use client";

import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import useAuthRedirect from "./hooks/useAuthRedirect";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [topic, setTopic] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  // useAuthRedirect("guest"); // not logged in → go login, logged in → stay
  const logout = useCallback(async () => {
    try {
      await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      if (socket) {
        socket.disconnect();
      }
      window.location.href = "/login";
    }
  }, [socket]);

  useEffect(() => {
    let newSocket;

    const init = async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/me", {
          credentials: "include",
        });

        const data = await res.json();

        if (!data.user) {
          window.location.href = "/login";
          return;
        }

        newSocket = io("http://localhost", {
          path: "/socket.io",
          withCredentials: true,
          transports: ["websocket"],
        });

        newSocket.on("connect", () => {
          setConnected(true);
          console.log("Connected to socket server", newSocket.id);
        });

        newSocket.on("disconnect", () => {
          setConnected(false);
          console.log("Disconnected from socket server");
        });
        newSocket.on("connect_error", () => {
          setConnected(false);
          console.error("Connection error to socket server");
        });
        newSocket.on("message", (data) => {
          setMessages((prev) => [...prev, data.message]);
        });

        setSocket(newSocket);
      } catch (err) {
        console.error("Auth check failed", err);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const subscribe = () => {
    if (!socket || !topic) return;
    socket.emit("subscribe", topic.trim().toLowerCase());
  };

  const sendMessage = () => {
    if (!socket || !topic) return;

    socket.emit("publish", {
      topic: topic.trim().toLowerCase(),
      message: "Hello at " + new Date().toLocaleTimeString(),
    });
  };

  if (loading) {
    return <p className="text-center mt-10">Checking auth...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Realtime System</h1>

        <button
          onClick={logout}
          className="w-full bg-red-500 text-white py-2 rounded mb-3"
        >
          Logout
        </button>

        <div className="mb-4 text-center text-sm">
          Status:{" "}
          <span className={connected ? "text-green-600" : "text-red-600"}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <input
          className="w-full border p-2 rounded mb-3 text-black"
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
              <div key={i} className="bg-white p-2 mb-2 rounded text-sm">
                {msg}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
