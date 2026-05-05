const express = require("express");

const app = express();
app.use(express.json());

const authRoutes = require("./routes/auth.routes");

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Auth service running ✅");
});

app.listen(4000, () => {
  console.log("🔐 Auth service running on port 4000");
});