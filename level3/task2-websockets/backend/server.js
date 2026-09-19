require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const registerChatSocket = require("./sockets/chatSocket");

connectDB();

const app = express();
const configuredFrontendOrigin = process.env.FRONTEND_URL || "*";
const allowedOrigins = configuredFrontendOrigin === "*"
  ? "*"
  : configuredFrontendOrigin.split(",").map((origin) => origin.trim());
const isAllowedOrigin = (origin, callback) => {
  if (!origin || allowedOrigins === "*" || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  return callback(new Error("CORS origin not allowed"));
};
app.use(cors({ origin: isAllowedOrigin }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Level 3 Task 2 - WebSocket Chat API is running");
});

app.use("/api/auth", authRoutes);

// --- Wrap the Express app in a plain HTTP server so Socket.io can attach to it ---
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: isAllowedOrigin },
});

registerChatSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`HTTP + WebSocket server running on http://localhost:${PORT}`)
);
