import { useEffect } from "react";
import { authFetch } from "../lib/authFetch";

export default function useAuthRedirect(redirectIfAuth = true) {
  useEffect(() => {
    const check = async () => {
      const res = await authFetch("/auth/me");
      const data = await res.json();

      if (redirectIfAuth && data.user) {
        window.location.href = "/";
      }

      if (!redirectIfAuth && !data.user) {
        window.location.href = "/login";
      }
    };

    check();
  }, [redirectIfAuth]);
}