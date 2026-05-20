"use client";

import { useState } from "react";
import useAuthRedirect from "../hooks/useAuthRedirect";
import Link from "next/dist/client/link";

export default function Register() {
  useAuthRedirect(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const res = await fetch("http://localhost:4000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = "/login";
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="p-4 flex justify-between items-center gap-2 flex-col">
      <h1>Register</h1>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleRegister}>Register</button>
      <p className="text-sm mt-2 text-center">
        Already have an account? <Link href="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}