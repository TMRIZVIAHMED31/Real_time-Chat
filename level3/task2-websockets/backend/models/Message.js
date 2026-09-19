const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
      default: "general", // simple single room; extend to multiple rooms if needed
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: { type: String, required: true }, // denormalized for fast reads
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Index for fetching a room's history sorted by time, efficiently
messageSchema.index({ room: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
