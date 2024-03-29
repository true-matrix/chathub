import mongoose from "mongoose";
import { ChatEventEnum } from "../../../constants.js";
import { Chat } from "../../../models/apps/chat-app/chat.models.js";
import { ChatMessage } from "../../../models/apps/chat-app/message.models.js";
import { emitSocketEvent } from "../../../socket/index.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { getLocalPath, getStaticFilePath } from "../../../utils/helpers.js";

/**
 * @description Utility function which returns the pipeline stages to structure the chat message schema with common lookups
 * @returns {mongoose.PipelineStage[]}
 */
const chatMessageCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sender",
        as: "sender",
        pipeline: [
          {
            $project: {
              name: 1,
              username: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        sender: { $first: "$sender" },
      },
    },
  ];
};

const getAllMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) {
    throw new ApiError(404, "Chat does not exist");
  }

  // Only send messages if the logged in user is a part of the chat he is requesting messages of
  if (!selectedChat.participants?.includes(req.user?._id)) {
    throw new ApiError(400, "User is not a part of this chat");
  }

  const messages = await ChatMessage.aggregate([
    {
      $match: {
        chat: new mongoose.Types.ObjectId(chatId),
      },
    },
    ...chatMessageCommonAggregation(),
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, messages || [], "Messages fetched successfully")
    );
});

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  if (!content && !req.files?.attachments?.length) {
    throw new ApiError(400, "Message content or attachment is required");
  }

  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) {
    throw new ApiError(404, "Chat does not exist");
  }

  const messageFiles = [];

  if (req.files && req.files.attachments?.length > 0) {
    req.files.attachments?.map((attachment) => {
      messageFiles.push({
        url: getStaticFilePath(req, attachment.filename),
        localPath: getLocalPath(attachment.filename),
      });
    });
  }

  // Create a new message instance with appropriate metadata
  const message = await ChatMessage.create({
    sender: new mongoose.Types.ObjectId(req.user._id),
    content: content || "",
    chat: new mongoose.Types.ObjectId(chatId),
    attachments: messageFiles,
  });

  // update the chat's last message which could be utilized to show last message in the list item
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: {
        lastMessage: message._id,
      },
    },
    { new: true }
  );

  // structure the message
  let messages = await ChatMessage.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(message._id),
      },
    },
    ...chatMessageCommonAggregation(),
  ]);

  // Store the aggregation result
  let receivedMessage = messages[0];

  // console.log("message=>", message);
  // console.log("chat=>", chat);
  // console.log("messages=>", messages);
  // console.log("receivedMessage=>", receivedMessage);

  if (!receivedMessage) {
    throw new ApiError(500, "Internal server error");
  }

  //Case-1
  // Emit a socket event to indicate that the message has been sent
  emitSocketEvent(
    req,
    chatId, // Emit to the chat room
    ChatEventEnum.MESSAGE_SENT_EVENT,
    receivedMessage
  );

  //Case-2
  // logic to emit socket event about the new message created to the other participants
  chat.participants.forEach((participantObjectId) => {
    // here the chat is the raw instance of the chat in which participants is the array of object ids of users
    // avoid emitting event to the user who is sending the message
    if (participantObjectId.toString() === req.user._id.toString()) return;

    // emit the receive message event to the other participants with received message as the payload
    emitSocketEvent(
      req,
      participantObjectId.toString(),
      ChatEventEnum.MESSAGE_RECEIVED_EVENT,
      receivedMessage
    );
    
  //  // Update the message seen status for the recipient
    ChatMessage.updateOne(
      { _id: new mongoose.Types.ObjectId(receivedMessage._id), sender: participantObjectId.toString() },
      { $set: { seen: true } }
  ).exec();
  });

  //Case-3
  // When a user reads the message, emit a socket event
  // to inform other participants that the message has been seen by at least one user
  chat.participants.forEach(async (participantObjectId) => {
    // here the chat is the raw instance of the chat in which participants is the array of object ids of users
    // avoid emitting event to the user who is sending the message
    if (participantObjectId.toString() === req.user._id.toString()) return;


    // emit the receive message event to the other participants with received message as the payload
    emitSocketEvent(
      req,
      participantObjectId.toString(),
      ChatEventEnum.MESSAGE_SEEN_BY_ONE_EVENT,
      receivedMessage
    );
    // Update seenBy array in the message model
    message.seenBy.push(participantObjectId); // Add the participant to seenBy array
  });

  //Case-4
  // Check if all participants have seen the message
  const allParticipantsSeen = chat.participants.every(participantObjectId => {
    return message.seenBy.includes(participantObjectId);
  });

  // If all participants have seen the message, emit a socket event
  if (allParticipantsSeen) {
    emitSocketEvent(
      req,
      chatId, // Emit to the chat room
      ChatEventEnum.MESSAGE_SEEN_BY_ALL_EVENT,
      receivedMessage
    );
  }

  
  // Save the message with updated seenBy array
  await message.save();


  return res
    .status(201)
    .json(new ApiResponse(201, receivedMessage, "Message saved successfully"));
});

// Define a route handler to handle message editing
const editMessage = asyncHandler(async (req, res) => {
  try {
    // console.log("req.body", req.body);
    const { chatId, messageId } = req.params;
    const content = Object.keys(req.body)[0];

    // Validate the content
    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }

    // Find the chat in the database
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Find the message to edit
    const message = await ChatMessage.findByIdAndUpdate(
      messageId,
      {
        $set: {
          content: content,
          edited: true,
        },
      }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // structure the message
    const messages = await ChatMessage.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(messageId),
        },
      },
      ...chatMessageCommonAggregation(),
    ]);

    const receivedMessage = messages[0];
    if (!receivedMessage) {
      throw new ApiError(500, "Internal server error");
    }
    // Emit a socket event to notify other participants about the edited message
    chat.participants.forEach((participantObjectId) => {
      if (participantObjectId.toString() === req.user._id.toString()) return;

      // Emit the message edited event to the other participants with edited message details
      emitSocketEvent(
        req,
        participantObjectId.toString(),
        ChatEventEnum.MESSAGE_EDITED_EVENT,
        receivedMessage
      );
    });

    return res.status(200).json(new ApiResponse(200, receivedMessage, 'Message edited successfully'));
  } catch (error) {
    console.error("Error editing message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const replyToMessage = asyncHandler(async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    // const content = Object.keys(req.body)[0];
    const content = req.body.content;

    // Validate the content
    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }

    // Find the chat in the database
     const selectedChat = await Chat.findById(chatId);

      if (!selectedChat) {
        throw new ApiError(404, "Chat does not exist");
      }

    // Find the message to reply to
    const parentMessage = await ChatMessage.findById(messageId);

    if (!parentMessage) {
      return res.status(404).json({ error: "Parent message not found" });
    }

  const messageFiles = [];

  if (req.files && req.files.attachments?.length > 0) {
    req.files.attachments?.map((attachment) => {
      messageFiles.push({
        url: getStaticFilePath(req, attachment.filename),
        localPath: getLocalPath(attachment.filename),
      });
    });
  }
const updatedParentMessage = await ChatMessage.findByIdAndUpdate(
      messageId,
      { $set: { ...parentMessage.toObject() } }, // Use toObject() to convert parentMessage to a plain JavaScript object
      { new: true }
    );
    // Create and save the reply message
    const replyMessage = await ChatMessage.create({
      sender: new mongoose.Types.ObjectId(req.user._id),
      content: content || "",
      chat: new mongoose.Types.ObjectId(chatId),
      attachments: messageFiles,
      parentMessage: new mongoose.Types.ObjectId(parentMessage._id),
      updatedParentMessage: updatedParentMessage,
    });


    if (!parentMessage.replies) {
        parentMessage.replies = []; // Initialize replies array if it doesn't exist
      }
    // Add the reply message to the parent message's replies array
    parentMessage.replies.push(replyMessage._id);
    await parentMessage.save();

    
    // update the chat's last message which could be utilized to show last message in the list item
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $set: {
          lastMessage: replyMessage._id,
        },
      },
      { new: true }
    );

 // Fetch parent message details by ID and save it to the database
    // const updatedParentMessage = await ChatMessage.findByIdAndUpdate(
    //   messageId,
    //   { $set: { ...parentMessage.toObject() } }, // Use toObject() to convert parentMessage to a plain JavaScript object
    //   { new: true }
    // );
  // structure the message
  let messages = await ChatMessage.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(replyMessage._id),
      },
    },
    ...chatMessageCommonAggregation(),
  ]);

  // Store the aggregation result
    // let receivedMessage = messages[0];
    // Perform a lookup to join updatedParentMessage and message[0]
    
    let receivedMessage = messages[0];
    // if (receivedMessage) {
    //   receivedMessage = {
    //     ...receivedMessage,
    //     updatedParentMessage: updatedParentMessage,
    //   };
    // }


    // Emit a socket event to notify other participants about the new reply
    chat.participants.forEach((participantObjectId) => {
      if (participantObjectId.toString() === req.user._id.toString()) return;

      // Emit the message reply event to the other participants with reply message details
      emitSocketEvent(
        req,
        participantObjectId.toString(),
        ChatEventEnum.MESSAGE_REPLY_EVENT,
        receivedMessage
      );
    });

  return res
    .status(201)
    .json(new ApiResponse(201, receivedMessage, "Reply sent successfully"));
  } catch (error) {
    console.error("Error replying to message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// Delete Message Controller
const deleteMessage = asyncHandler(async (req, res) => {
  try {
    const { chatId, messageId } = req.params;

    // Find the chat in the database
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Find the message to delete
    const deletedMessage = await ChatMessage.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Emit a socket event to notify other participants about the deleted message
    chat.participants.forEach((participantObjectId) => {
      if (participantObjectId.toString() === req.user._id.toString()) return;

      // Emit the message deleted event to the other participants with deleted message details
      emitSocketEvent(
        req,
        participantObjectId.toString(),
        ChatEventEnum.MESSAGE_DELETED_EVENT,
        { messageId: deletedMessage._id }
      );
    });

    return res.status(200).json(new ApiResponse(200, null, 'Message deleted successfully'));
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});






export { getAllMessages, sendMessage, editMessage, replyToMessage, deleteMessage };
