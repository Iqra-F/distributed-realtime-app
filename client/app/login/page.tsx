"use client";

import { useState } from "react";
import useAuthRedirect from "../hooks/useAuthRedirect";
import Link from "next/link";

export default function LoginPage() {
  useAuthRedirect(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        alert("Login failed");
      }
    } catch (err) {
      alert("Server not reachable");
      console.error(err);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white p-6 shadow rounded w-80">
        <h2 className="text-xl mb-4">Login</h2>

        <input
          className="border w-full mb-2 p-2 text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <input
          className="border w-full mb-4 p-2 text-black"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white w-full py-2 rounded"
        >
          Login
        </button>
        {/* if not sign up, go to sign up page */}
        <p className="text-sm mt-2 text-center">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
