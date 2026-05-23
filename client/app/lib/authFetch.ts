export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  let res = await fetch(input, {
    ...init,
    credentials: "include",
  });

  // If access token expired → try refresh once
  if (res.status === 401) {
    const refreshRes = await fetch("/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      res = await fetch(input, {
        ...init,
        credentials: "include",
      });
    }
  }

  return res;
}