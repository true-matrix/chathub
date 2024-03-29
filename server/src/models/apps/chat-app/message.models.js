import mongoose, { Schema } from "mongoose";

// TODO: Add image and pdf file sharing in the next version
const chatMessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    senderName: {
      type: String, 
    },
    content: {
      type: String,
    },
    attachments: {
      type: [
        {
          url: String,
          localPath: String,
        },
      ],
      default: [],
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
    edited: {
      type: Boolean,
      default: false,
    },
    status: {
    type: String,
    enum: ['sent', 'messageReceived', 'seenByOne', 'seenByAll'],
    default: 'sent'
    },
    // Array to store users who have seen the message
    seenBy: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    seen: {
    type: Boolean,
    default: false
    },
    parentMessage : {
      type: Schema.Types.ObjectId,
      ref: "ChatMessage",
    },
    updatedParentMessage: {
      type: Object,
      default: null,
    }
  },
  { timestamps: true }
);

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
