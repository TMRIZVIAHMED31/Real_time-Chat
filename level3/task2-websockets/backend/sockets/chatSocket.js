const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");

// Keeps track of which socket id belongs to which user, so we can send
// "user-specific" notifications (Task 2 objective) instead of only broadcasting.
const onlineUsers = new Map(); // userId -> Set of socket ids

function registerChatSocket(io) {
  // --- 1. Authenticate every socket connection using the same JWT as the REST API ---
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error: no token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("Authentication error: user not found"));

      socket.user = { id: user._id.toString(), name: user.name };
      next();
    } catch (err) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  // --- 2. Handle connections ---
  io.on("connection", (socket) => {
    const { id: userId, name } = socket.user;
    console.log(`Socket connected: ${name} (${socket.id})`);

    // Track this user as online (bidirectional, multiple tabs supported)
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // Notify everyone else this user came online
    socket.broadcast.emit("user:online", { userId, name });

    // --- Join a room (default "general") ---
    socket.on("room:join", async (room = "general") => {
      socket.join(room);
      socket.currentRoom = room;

      // Send chat history for this room (optimized: last 50 only)
      const history = await Message.find({ room })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      socket.emit("room:history", history.reverse());

      io.to(room).emit("room:notice", `${name} joined ${room}`);
    });

    // --- Send a message: persist to MongoDB, then broadcast in real time ---
    socket.on("message:send", async ({ room = "general", text }) => {
      if (!text || !text.trim()) return;
      try {
        const message = await Message.create({
          room,
          sender: userId,
          senderName: name,
          text: text.trim(),
        });
        // Bidirectional real-time broadcast to everyone in the room (including sender)
        io.to(room).emit("message:new", {
          _id: message._id,
          room: message.room,
          senderName: message.senderName,
          text: message.text,
          createdAt: message.createdAt,
        });
      } catch (err) {
        socket.emit("error:message", "Failed to send message");
      }
    });

    // --- User-specific notification example (Task 2 objective) ---
    socket.on("notify:user", ({ targetUserId, text }) => {
      const targetSockets = onlineUsers.get(targetUserId);
      if (!targetSockets) return; // target is offline; in a real app you'd store this for later
      targetSockets.forEach((sockId) => {
        io.to(sockId).emit("notification", { from: name, text });
      });
    });

    // --- Typing indicator (cheap, efficient real-time UX touch) ---
    socket.on("typing", (room) => {
      socket.to(room).emit("typing", { name });
    });

    // --- Disconnect cleanup ---
    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit("user:offline", { userId, name });
        }
      }
      console.log(`Socket disconnected: ${name} (${socket.id})`);
    });
  });
}

module.exports = registerChatSocket;
