const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
const authRoutes = require("./routes/auth.routes");

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Auth service running ✅");
});

app.listen(4000, () => {
  console.log("🔐 Auth service running on port 4000");
});