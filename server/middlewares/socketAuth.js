module.exports = (socket, next) => {
  try {
    console.log("Headers:", socket.handshake.headers);

    const cookies = socket.handshake.headers.cookie;

    if (!cookies) {
      console.log("❌ No cookies received");
      return next(new Error("No cookies"));
    }

    const parsed = cookie.parse(cookies);
    const token = parsed.token;

    if (!token) {
      console.log("❌ No token in cookies");
      return next(new Error("No token"));
    }

    const decoded = jwt.verify(token, "supersecret");

    socket.user = decoded;

    next();
  } catch (err) {
    console.log("❌ Auth error:", err.message);
    next(new Error("Unauthorized"));
  }
};