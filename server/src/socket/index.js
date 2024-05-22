import cookie from "cookie";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { AvailableChatEvents, ChatEventEnum } from "../constants.js";
import { User } from "../models/apps/auth/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ChatMessage } from "../models/apps/chat-app/message.models.js";

/**
 * @description This function is responsible to allow user to join the chat represented by chatId (chatId). event happens when user switches between the chats
 * @param {Socket<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>} socket
 */
const mountJoinChatEvent = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log(`User joined the chat 🤝. chatId: `, chatId);
    // joining the room with the chatId will allow specific events to be fired where we don't bother about the users like typing events
    // E.g. When user types we don't want to emit that event to specific participant.
    // We want to just emit that to the chat where the typing is happening
    socket.join(chatId);
  });
};

/**
 * @description This function is responsible to emit the typing event to the other participants of the chat
 * @param {Socket<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>} socket
 */
const mountParticipantTypingEvent = (socket) => {
  socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
  });
};

/**
 * @description This function is responsible to emit the stopped typing event to the other participants of the chat
 * @param {Socket<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>} socket
 */
const mountParticipantStoppedTypingEvent = (socket) => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

// This function is responsible to emit the message seen by other participants
const mountMessageSeenEvent = (socket) => {
  socket.on(ChatEventEnum.MESSAGE_SEEN_EVENT, async (messageId) => {
    console.log('messageId', messageId);
    socket.in(messageId).emit(ChatEventEnum.MESSAGE_SEEN_EVENT, messageId);
     await ChatMessage.findByIdAndUpdate(messageId, { $set: { seen: true } })
  });
}

// Define a Map to store connected users
const connectedUsers = new Map();
let activeUsers = [];

/**
 *
 * @param {Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>} io
 */
const initializeSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
      // parse the cookies from the handshake headers (This is only possible if client has `withCredentials: true`)
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

      let token = cookies?.accessToken; // get the accessToken

      if (!token) {
        // If there is no access token in cookies. Check inside the handshake auth
        token = socket.handshake.auth?.token;
      }

      if (!token) {
        // Token is required for the socket to work
        throw new ApiError(401, "Un-authorized handshake. Token is missing");
      }

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // decode the token

      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      );

      // retrieve the user
      if (!user) {
        throw new ApiError(401, "Un-authorized handshake. Token is invalid");
      }
      socket.user = user; // mount te user object to the socket

      connectedUsers.set(socket.user._id.toString(), socket);

      // We are creating a room with user id so that if user is joined but does not have any active chat going on.
      // still we want to emit some socket events to the user.
      // so that the client can catch the event and show the notifications.
      socket.join(user._id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT); // emit the connected event so that client is aware
            
      socket.on('new-user-add', (newUserId) => {
          //if user is not added previously
            if(!activeUsers.some((user)=> user.userId === newUserId))
            {
                activeUsers.push({
                userId: newUserId,
                socketId: socket.user?._id.toString(),
                status: 'online',
                lastActive: new Date()
              })
        }
        // console.log('Connected Users',activeUsers);
          io.emit('get-users', activeUsers)
      })
      
      // Emit connectedUsers data when it changes
      const emitConnectedUsers = () => {
        io.emit("connectedUsers", Array.from(connectedUsers.keys()));
      };

       const updateUserStatus = (userId, status) => {
        const userIndex = activeUsers.findIndex(user => user.userId === userId);
        if (userIndex !== -1) {
          activeUsers[userIndex].status = status;
          activeUsers[userIndex].lastActive = new Date();
        } 
        io.emit('get-users', activeUsers);
      };

      updateUserStatus(user._id.toString(), 'online');

            // socket.on('new-user-add', (newUserId) => {
            //   updateUserStatus(newUserId, 'online');
            // });

            socket.on(ChatEventEnum.UPDATE_STATUS, (status) => {
              updateUserStatus(socket.user._id.toString(), status);
            });

      emitConnectedUsers(); // Emit connectedUsers data after adding the user
      console.log("User connected 🗼. userId: ", user._id.toString());
      await User.findByIdAndUpdate({ _id: decodedToken?._id }, { $set: { islogin: true, isOnline: true } })

      // Common events that needs to be mounted on the initialization
      mountJoinChatEvent(socket);
      mountParticipantTypingEvent(socket);
      mountParticipantStoppedTypingEvent(socket);
      mountMessageSeenEvent(socket);

      socket.on(ChatEventEnum.DISCONNECT_EVENT, async () => {
        console.log("user has disconnected 🚫. userId: " + socket.user?._id);
        // connectedUsers.delete(socket.user._id.toString());

        // activeUsers = activeUsers.filter((user) => user.socketId !== socket.id)
        activeUsers = activeUsers.filter((user) => user.userId !== socket.user?._id.toString())
        // console.log('User Disconnected',activeUsers);
        io.emit('get-users', activeUsers)
        
        // emitConnectedUsers(); // Emit connectedUsers data after removing the user
        await User.findByIdAndUpdate({ _id: socket.user?._id }, { $set: { verified: false, islogin: false, isOnline: false } })

        if (socket.user?._id) {
          socket.leave(socket.user._id);
        }
      });
      const checkAwayStatus = () => {
        const now = new Date();
        activeUsers.forEach((user, index) => {
          if (user.status === 'online' && (now - new Date(user.lastActive)) > 30000) { // 30 secs
            activeUsers[index].status = 'away';
            io.to(user.socketId).emit(ChatEventEnum.UPDATE_STATUS, 'away');
          }
        });
        io.emit('get-users', activeUsers);
      };

      setInterval(checkAwayStatus, 30000); // Check every 30 secs
    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message || "Something went wrong while connecting to the socket."
      );
    }
  });
};

/**
 *
 * @param {import("express").Request} req - Request object to access the `io` instance set at the entry point
 * @param {string} roomId - Room where the event should be emitted
 * @param {AvailableChatEvents[0]} event - Event that should be emitted
 * @param {any} payload - Data that should be sent when emitting the event
 * @description Utility function responsible to abstract the logic of socket emission via the io instance
 */
const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get("io").in(roomId).emit(event, payload);
};
export { initializeSocketIO, emitSocketEvent };
