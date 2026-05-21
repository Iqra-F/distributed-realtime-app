const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config(); 

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost",
  credentials: true
}));
const authRoutes = require("./routes/auth.routes");
const { log } = require("/shared/logger");

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Auth service running ✅");
});

app.listen(4000, () => {
  log("Auth service running on port 4000");
});