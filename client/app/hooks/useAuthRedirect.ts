"use client";

import { useEffect } from "react";

export default function useAuthRedirect(redirectIfAuth = true) {
  useEffect(() => {
    const check = async () => {
      const res = await fetch("/auth/me", {
        credentials: "include",
      });

      const data = await res.json();

      // already logged in → send to home
      if (redirectIfAuth && data.user) {
        window.location.href = "/";
      }

      // not logged in → optional (for protected pages later)
      if (!redirectIfAuth && !data.user) {
        window.location.href = "/login";
      }
    };

    check();
  }, [redirectIfAuth]);
}