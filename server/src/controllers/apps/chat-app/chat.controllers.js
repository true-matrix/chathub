import mongoose from "mongoose";
import { ChatEventEnum } from "../../../constants.js";
import { User } from "../../../models/apps/auth/user.models.js";
import { Chat } from "../../../models/apps/chat-app/chat.models.js";
import { ChatMessage } from "../../../models/apps/chat-app/message.models.js";
import { emitSocketEvent } from "../../../socket/index.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { removeLocalFile, getStaticFilePath, getLocalPath } from "../../../utils/helpers.js";

/**
 * @description Utility function which returns the pipeline stages to structure the chat schema with common lookups
 * @returns {mongoose.PipelineStage[]}
 */
const chatCommonAggregation = () => {
  return [
    {
      // lookup for the participants present
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "participants",
        as: "participants",
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
              forgotPasswordToken: 0,
              forgotPasswordExpiry: 0,
              emailVerificationToken: 0,
              emailVerificationExpiry: 0,
            },
          },
        ],
      },
    },
    {
      // lookup for the group chats
      $lookup: {
        from: "chatmessages",
        foreignField: "_id",
        localField: "lastMessage",
        as: "lastMessage",
        pipeline: [
          {
            // get details of the sender
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
        ],
      },
    },
    {
      $addFields: {
        lastMessage: { $first: "$lastMessage" },
      },
    },
    //
  ];
};

const groupChatCommonAggregation = () => {
  return [
    {
      // lookup for the group chats
      $lookup: {
        from: "chatmessages",
        foreignField: "_id",
        localField: "lastMessage",
        as: "lastMessage",
        pipeline: [
          {
            // get details of the sender
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
        ],
      },
    },
    {
      $addFields: {
        lastMessage: { $first: "$lastMessage" },
      },
    },
  ];
};

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
/**
 *
 * @param {string} chatId
 * @description utility function responsible for removing all the messages and file attachments attached to the deleted chat
 */
const deleteCascadeChatMessages = async (chatId) => {
  // fetch the messages associated with the chat to remove
  const messages = await ChatMessage.find({
    chat: new mongoose.Types.ObjectId(chatId),
  });

  let attachments = [];

  // get the attachments present in the messages
  attachments = attachments.concat(
    ...messages.map((message) => {
      return message.attachments;
    })
  );

  attachments.forEach((attachment) => {
    // remove attachment files from the local storage
    removeLocalFile(attachment.localPath);
  });

  // delete all the messages
  await ChatMessage.deleteMany({
    chat: new mongoose.Types.ObjectId(chatId),
  });
};

const searchAvailableUsers = asyncHandler(async (req, res) => {
  const users = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: req.user._id, // avoid logged in user
        },
      },
    },
    {
      $project: {
        avatar: 1,
        name:1,
        username: 1,
        email: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  // Perform validation or error handling for userId if needed

  // const user = await User.findById(userId);
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.userId),
      },
    },
    // Omit the $project stage to retrieve all fields
  ]);

  if (!user || user.length === 0) {
    throw new ApiError(404, "User not found");
  }

  // const { avatar, username, email } = user;

  return res
    .status(200)
    .json(new ApiResponse(200, user[0], "User fetched successfully"));
});

const createOrGetAOneOnOneChat = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;

  // Check if it's a valid receiver
  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new ApiError(404, "Receiver does not exist");
  }

  // check if receiver is not the user who is requesting a chat
  if (receiver._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot chat with yourself");
  }

  const chat = await Chat.aggregate([
    {
      $match: {
        isGroupChat: false, // avoid group chats. This controller is responsible for one on one chats
        // Also, filter chats with participants having receiver and logged in user only
        $and: [
          {
            participants: { $elemMatch: { $eq: req.user._id } },
          },
          {
            participants: {
              $elemMatch: { $eq: new mongoose.Types.ObjectId(receiverId) },
            },
          },
        ],
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (chat.length) {
    // if we find the chat that means user already has created a chat
    return res
      .status(200)
      .json(new ApiResponse(200, chat[0], "Chat retrieved successfully"));
  }

  // if not we need to create a new one on one chat
  const newChatInstance = await Chat.create({
    name: "One on one chat",
    participants: [req.user._id, new mongoose.Types.ObjectId(receiverId)], // add receiver and logged in user as participants
    admin: req.user._id,
  });

  // structure the chat as per the common aggregation to keep the consistency
  const createdChat = await Chat.aggregate([
    {
      $match: {
        _id: newChatInstance._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = createdChat[0]; // store the aggregation result

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  // logic to emit socket event about the new chat added to the participants
  payload?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is initiating the chat

    // emit event to other participants with new chat as a payload
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.NEW_CHAT_EVENT,
      payload
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payload, "Chat retrieved successfully"));
});

const createAGroupChat = asyncHandler(async (req, res) => {
  const { name, participants } = req.body;

  // Check if user is not sending himself as a participant. This will be done manually
  if (participants.includes(req.user._id.toString())) {
    throw new ApiError(
      400,
      "Participants array should not contain the group creator"
    );
  }

  const members = [...new Set([...participants, req.user._id.toString()])]; // check for duplicates

  if (members.length < 3) {
    // check after removing the duplicate
    // We want group chat to have minimum 3 members including admin
    throw new ApiError(
      400,
      "Seems like you have passed duplicate participants."
    );
  }

  // Create a group chat with provided members
  const groupChat = await Chat.create({
    name,
    isGroupChat: true,
    participants: members,
    admin: req.user._id,
  });

  // structure the chat
  const chat = await Chat.aggregate([
    {
      $match: {
        _id: groupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  // logic to emit socket event about the new group chat added to the participants
  payload?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is initiating the chat
    // emit event to other participants with new chat as a payload
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.NEW_CHAT_EVENT,
      payload
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payload, "Group chat created successfully"));
});

// ****************************************************Supreme Alpha********************************************************************************//
const addUser = asyncHandler(async (req, res) => {
  const { username, name, email, password, phone, userRole, addedBy, aiStatus, gender, role } = req.body;
  // const existedUser = await User.findOne({ email : email });
  const existedUser = await User.findOne({
    $or: [
      { email: email },
      { username: username }, 
    ]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists", []);
  }
  // Generate a unique _id for the user
    const userId = new mongoose.Types.ObjectId();
  const user = await User.create({
    _id: userId,
    parentId: userId.toString(),
    username,
    name,
    email,
    password,
    phone, 
    userRole, 
    addedBy, 
    aiStatus, 
    gender,
    role: role || UserRolesEnum.USER,
  });
  // console.log('user',user);

  if (!user) {
    throw new ApiError(500, "Internal server error rajesh");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: user },
        "User added successfully"
      )
    );
});

const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Assuming you have the user ID in the request parameters
  const data = req.body;
  // Validate if the user with the given ID exists
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update user fields based on the request body
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      user[key] = data[key];
    }
  }

  // Save the updated user to the database
  await user.save({ validateBeforeSave: true }); // Set validateBeforeSave based on your needs

  // You can also send an email, update tokens, or perform additional actions if needed

  // Respond with the updated user
  return res.status(200).json(
    new ApiResponse(
      200,
      { user: user },
      "User updated successfully"
    )
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  const userIdToDelete = req.params.userId; // Assuming userId is part of the route parameters

  // Check if the user exists
  const existingUser = await User.findById(userIdToDelete);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  // Additional checks if needed (e.g., if the requester has the authority to delete the user)

  // Perform the user deletion
  const deletedUser = await User.findByIdAndDelete(userIdToDelete);

  if (!deletedUser) {
    throw new ApiError(500, "Internal server error while deleting user");
  }

  // You can customize the response based on your requirements
  return res.status(200).json(
    new ApiResponse(
      200,
      { deletedUserId: deletedUser._id },
      "User deleted successfully"
    )
  );
});

const getAllSupremeAlpha = asyncHandler(async (req, res) => {
  const users = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: req.user._id, // avoid logged in user
        },
        userRole: 'supremeAlpha', // filter by userRol
      },
    },
    // {
    //   $project: {
    //     avatar: 1,
    //     name: 1,
    //     email: 1,
    //   },
    // },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Supreme Alphas fetched successfully"));
});

// ****************************************************Alpha********************************************************************************//
const addAlpha = asyncHandler(async (req, res) => {
  const { username, name, email, password, phone, userRole, addedBy, parentId, aiStatus, gender, role } = req.body;
  // const existedUser = await User.findOne({ email : email });
  const existedUser = await User.findOne({
    $or: [
      { email: email },
      { username: username }, 
    ]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists", []);
  }
  // Generate a unique _id for the user
    const userId = new mongoose.Types.ObjectId();
  const user = await User.create({
    _id: userId,
    parentId,
    username,
    name,
    email,
    password,
    phone, 
    userRole, 
    addedBy, 
    aiStatus, 
    gender,
    role: role || UserRolesEnum.USER,
  });

  if (!user) {
    throw new ApiError(500, "Internal server error rajesh");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: user },
        "User added successfully"
      )
    );
});

const updateAlpha = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Assuming you have the user ID in the request parameters
  const data = req.body;
  // Validate if the user with the given ID exists
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update user fields based on the request body
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      user[key] = data[key];
    }
  }

  // Save the updated user to the database
  await user.save({ validateBeforeSave: true }); // Set validateBeforeSave based on your needs

  // Respond with the updated user
  return res.status(200).json(
    new ApiResponse(
      200,
      { user: user },
      "User updated successfully"
    )
  );
});

const deleteAlpha = asyncHandler(async (req, res) => {
  const userIdToDelete = req.params.userId; // Assuming userId is part of the route parameters

  // Check if the user exists
  const existingUser = await User.findById(userIdToDelete);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  // Perform the user deletion
  const deletedUser = await User.findByIdAndDelete(userIdToDelete);

  if (!deletedUser) {
    throw new ApiError(500, "Internal server error while deleting user");
  }

  // You can customize the response based on your requirements
  return res.status(200).json(
    new ApiResponse(
      200,
      { deletedUserId: deletedUser._id },
      "User deleted successfully"
    )
  );
});

const getAllAlpha = asyncHandler(async (req, res) => {
  const users = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: new mongoose.Types.ObjectId(req.user._id), // avoid logged in user
        },
        addedBy: (req.user._id).toString(), // filter by addedBy
        userRole: 'alpha', // filter by userRole
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Alphas fetched successfully"));
});

// ****************************************************Omega*********************************************************************************//
const addOmega = asyncHandler(async (req, res) => {
  const { username, name, email, password, phone, userRole, selectedAlpha, addedBy, parentId, addedByUserRole, aiStatus, gender, role } = req.body;
  // const existedUser = await User.findOne({ email : email });
  const existedUser = await User.findOne({
    $or: [
      { email: email },
      { username: username }, 
    ]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists", []);
  }
  // Generate a unique _id for the user
  const userId = new mongoose.Types.ObjectId();
  const user = await User.create({
    _id: userId,
    parentId,
    username,
    name,
    email,
    password,
    phone, 
    userRole,
    selectedAlpha, 
    addedBy, 
    parentId,
    addedByUserRole,
    aiStatus, 
    gender,
    role: role || UserRolesEnum.USER,
  });

  if (!user) {
    throw new ApiError(500, "Internal server error");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: user },
        "User added successfully"
      )
    );
});

const updateOmega = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Assuming you have the user ID in the request parameters
  const data = req.body;
  // Validate if the user with the given ID exists
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update user fields based on the request body
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      user[key] = data[key];
    }
  }

  // Save the updated user to the database
  await user.save({ validateBeforeSave: true }); // Set validateBeforeSave based on your needs

  // Respond with the updated user
  return res.status(200).json(
    new ApiResponse(
      200,
      { user: user },
      "User updated successfully"
    )
  );
});

const deleteOmega = asyncHandler(async (req, res) => {
  const userIdToDelete = req.params.userId; // Assuming userId is part of the route parameters

  // Check if the user exists
  const existingUser = await User.findById(userIdToDelete);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  // Perform the user deletion
  const deletedUser = await User.findByIdAndDelete(userIdToDelete);

  if (!deletedUser) {
    throw new ApiError(500, "Internal server error while deleting user");
  }

  // You can customize the response based on your requirements
  return res.status(200).json(
    new ApiResponse(
      200,
      { deletedUserId: deletedUser._id },
      "User deleted successfully"
    )
  );
});

const getAllOmega = asyncHandler(async (req, res) => {
  let users;
  if (req.user.userRole === 'alpha') {
    users = await User.aggregate([
      {
        $match: {
          $or: [
            // { $and: [{ addedBy: new mongoose.Types.ObjectId(req.user._id), userRole: 'omega' }] },
            { $and: [{ addedBy: (req.user._id).toString(), userRole: 'omega' }] },
            { $and: [{ selectedAlpha: (req.user._id).toString(), userRole: 'omega' }] },
          ],
        },
      },
    ]);
  } else if(req.user.userRole === 'supremeAlpha'){
    users = await User.aggregate([
      {
        $match: {
          $or: [
            // { $and: [{ addedBy: new mongoose.Types.ObjectId(req.user._id), userRole: 'omega' }] },
            { $and: [{ addedBy: (req.user._id).toString(), userRole: 'omega' }] },
            { $and: [{ parentId: (req.user._id).toString(), userRole: 'omega' }] },
          ],
        },
      },
    ]);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Omegas fetched successfully"));
});

///************************************OTP******************************************///
//show otp as per hierarchy
const getAllOTPs = asyncHandler(async (req, res) => {
  let users;
  if (req.user.userRole === 'alpha') {
    users = await User.aggregate([
      {
        $match: {
          $or: [
            { $and: [{ parentId: (req.user.parentId).toString(), userRole: 'omega' }] },
            { $and: [{ parentId: (req.user.parentId).toString(), userRole: 'alpha' }] },
          ],
          _id: {
            $ne: new mongoose.Types.ObjectId(req.user._id), // avoid logged in user
          },
        },
      },
    ]);
  } else if(req.user.userRole === 'supremeAlpha'){
    users = await User.aggregate([
      {
        $match: {
          $or: [
            { addedBy: new mongoose.Types.ObjectId(req.user._id)},
            { parentId: (req.user.parentId) },
          ],
          _id: {
            $ne: new mongoose.Types.ObjectId(req.user._id), // avoid logged in user
          },
        },
      },
    ]);
  } else if(req.user.userRole === 'admin'){
    users = await User.aggregate([
      {
        $match: {
          userRole: 'supremeAlpha',
        },
      },
    ]);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Omegas fetched successfully"));
});
///************************************Contacts******************************************///
//Get all Contacts / Get all available users
const getAllContacts = asyncHandler(async (req, res) => {
  let users;
  if (req.user.userRole === 'omega') {
    users = await User.aggregate([
      {
        $match: {
          $or: [
            {  _id: new mongoose.Types.ObjectId(req.user.addedBy)  },
            { $and: [{  _id: new mongoose.Types.ObjectId(req.user.parentId), userRole: 'supremeAlpha' }]},
            { $and: [{  parentId: (req.user.parentId).toString(), userRole: 'alpha' }]},
          ],
          _id: {
            $ne: new mongoose.Types.ObjectId(req.user._id), // avoid logged in user
          },
        },
      },
    ]);
  } else if (req.user.userRole === 'alpha') {
    users = await User.aggregate([
      {
        $match: {
          $or: [
            {  _id: new mongoose.Types.ObjectId(req.user.addedBy)  },
            {  _id: new mongoose.Types.ObjectId(req.user.parentId)  },
            {  parentId: (req.user.parentId).toString()  },
          ],
          _id: {
            $ne: new mongoose.Types.ObjectId(req.user._id), // avoid logged in user
          },
        },
      },
    ]);
  } else if(req.user.userRole === 'supremeAlpha'){
    users = await User.aggregate([
      {
        $match: {
          $or: [
            { addedBy: new mongoose.Types.ObjectId(req.user._id)},
            { parentId: (req.user.parentId) },
          ],
          _id: {
            $ne: new mongoose.Types.ObjectId(req.user._id), // avoid logged in user
          },
        },
      },
    ]);
  } else if(req.user.userRole === 'admin'){
    users = await User.aggregate([
      {
        $match: {
          userRole: 'supremeAlpha',
        },
      },
    ]);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Omegas fetched successfully"));
});

///************************************User Profile Update******************************************///
const updateProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Assuming you have the user ID in the request parameters
  const data = req.body;
  // Validate if the user with the given ID exists
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update user fields based on the request body
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      user[key] = data[key];
    }
  }

  // Save the updated user to the database
  await user.save({ validateBeforeSave: true }); // Set validateBeforeSave based on your needs

  // Respond with the updated user
  return res.status(200).json(
    new ApiResponse(
      200,
      { user: user },
      "User updated successfully"
    )
  );
});

const updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file?.filename) {
    throw new ApiError(400, "Profile image is required");
  }
  const profileImageUrl = getStaticFilePath(req, req.file?.filename);
  const profileImageLocalPath = getLocalPath(req.file?.filename);
  const user = await User.findOne({
    _id: new mongoose.Types.ObjectId(req.user._id),
  });
  let updatedProfile = await User.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(req.user._id),
    },
    {
      $set: {
        // set the newly uploaded image
        avatar: {
          url: profileImageUrl ,
          localPath: profileImageLocalPath ,
        },
      },
    },
    { new: true }
  );
  removeLocalFile(user.avatar.localPath);
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProfile, "Profile image updated successfully")
    );
}); 

// *****************************************************************************************************************************************//

// const getGroupChatDetails = asyncHandler(async (req, res) => {
//   const { chatId } = req.params;
//   const groupChat = await Chat.aggregate([
//     {
//       $match: {
//         _id: new mongoose.Types.ObjectId(chatId),
//         isGroupChat: true,
//       },
//     },
//     ...chatCommonAggregation(),
//   ]);

//   const chat = groupChat[0];

//   if (!chat) {
//     throw new ApiError(404, "Group chat does not exist");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, chat, "Group chat fetched successfully"));
// });

const getGroupChatDetails = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // Retrieve group chat details including participants and last message
  const groupChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const chat = groupChat[0];

  if (!chat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  // Fetch attachments for messages within the group chat
  const attachment = await ChatMessage.aggregate([
    {
      $match: {
        chat: new mongoose.Types.ObjectId(chatId),
        attachments: { $exists: true }, // Filter messages with attachments
      },
    },
    {
    $match: {
      attachments: { $ne: [] } // Filter out documents where attachments array is not empty
    }
  },
    ...chatMessageCommonAggregation(), // Reuse the common aggregation logic
    {
      $project: {
        _id: 0, // Exclude _id field from the output
        attachments: 1, // Include only the attachment field
      },
    },
  ]);

  // Use Array.prototype.reduce() to flatten the structure of the attachments array
  const attachmentUrls = attachment.reduce((accumulator, message) => {
  // Extract the attachments array from each message
  const attachments = message.attachments;
  // If attachments array is not empty, concatenate the attachment objects to accumulator
  if (attachments.length > 0) {
    return accumulator.concat(attachments.map(attachment => ({
      url: attachment.url,
      localPath: attachment.localPath,
      _id: attachment._id
    })));
  }
  return accumulator;
}, []);
  

  // Merge attachment URLs with the group chat details
  const groupChatWithAttachments = {
    ...chat,
    attachments: attachmentUrls,
  };

  return res.status(200).json(new ApiResponse(200, groupChatWithAttachments, "Group chat with attachments fetched successfully"));
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { name } = req.body;

  // check for chat existence
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  // // only admin can change the name
  // if (groupChat.admin?.toString() !== req.user._id?.toString()) {
  //   throw new ApiError(404, "You are not an admin");
  // }

  // Check if the user is the admin or has the role 'supremeAlpha'
  if (
    groupChat.admin?.toString() !== req.user._id?.toString() &&
    req.user.userRole !== 'supremeAlpha'
  ) {
    throw new ApiError(403, "You are not authorized to change the name");
  }

  const updatedGroupChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: {
        name,
      },
    },
    { new: true }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedGroupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  // logic to emit socket event about the updated chat name to the participants
  payload?.participants?.forEach((participant) => {
    // emit event to all the participants with updated chat as a payload
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.UPDATE_GROUP_NAME_EVENT,
      payload
    );
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, chat[0], "Group chat name updated successfully")
    );
});

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // check for the group chat existence
  const groupChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const chat = groupChat[0];

  if (!chat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  // // check if the user who is deleting is the group admin
  // if (chat.admin?.toString() !== req.user._id?.toString()) {
  //   throw new ApiError(404, "Only admin can delete the group");
  // }
  // Check if the user is the admin or has the role 'supremeAlpha'
  if (
    groupChat.admin?.toString() !== req.user._id?.toString() &&
    req.user.userRole !== 'supremeAlpha'
  ) {
    throw new ApiError(403, "You are not authorized to delete the pack");
  }

  await Chat.findByIdAndDelete(chatId); // delete the chat

  await deleteCascadeChatMessages(chatId); // remove all messages and attachments associated with the chat

  // logic to emit socket event about the group chat deleted to the participants
  chat?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is deleting
    // emit event to other participants with left chat as a payload
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.LEAVE_CHAT_EVENT,
      chat
    );
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Group chat deleted successfully"));
});

const deleteOneOnOneChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // check for chat existence
  const chat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(404, "Chat does not exist");
  }

  await Chat.findByIdAndDelete(chatId); // delete the chat even if user is not admin because it's a personal chat

  await deleteCascadeChatMessages(chatId); // delete all the messages and attachments associated with the chat

  const otherParticipant = payload?.participants?.find(
    (participant) => participant?._id.toString() !== req.user._id.toString() // get the other participant in chat for socket
  );

  // emit event to other participant with left chat as a payload
  emitSocketEvent(
    req,
    otherParticipant._id?.toString(),
    ChatEventEnum.LEAVE_CHAT_EVENT,
    payload
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chat deleted successfully"));
});

const leaveGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // check if chat is a group
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  const existingParticipants = groupChat.participants;

  // check if the participant that is leaving the group, is part of the group
  if (!existingParticipants?.includes(req.user?._id)) {
    throw new ApiError(400, "You are not a part of this group chat");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: req.user?._id, // leave the group
      },
    },
    { new: true }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Left a group successfully"));
});

const addNewParticipantInGroupChat = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;

  // check if chat is a group
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  // // check if user who is adding is a group admin
  // if (groupChat.admin?.toString() !== req.user._id?.toString()) {
  //   throw new ApiError(404, "You are not an admin");
  // }

  // Check if the user is the admin or has the role 'supremeAlpha'
  if (
    groupChat.admin?.toString() !== req.user._id?.toString() &&
    req.user.userRole !== 'supremeAlpha'
  ) {
    throw new ApiError(403, "You are not authorized to add participants to pack");
  }

  const existingParticipants = groupChat.participants;

  // check if the participant that is being added in a part of the group
  if (existingParticipants?.includes(participantId)) {
    throw new ApiError(409, "Participant already in a group chat");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        participants: participantId, // add new participant id
      },
    },
    { new: true }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  // emit new chat event to the added participant
  emitSocketEvent(req, participantId, ChatEventEnum.NEW_CHAT_EVENT, payload);

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Participant added successfully"));
});

const removeParticipantFromGroupChat = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;

  // check if chat is a group
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  // // check if user who is deleting is a group admin
  // if (groupChat.admin?.toString() !== req.user._id?.toString()) {
  //   throw new ApiError(404, "You are not an admin");
  // }
  // Check if the user is the admin or has the role 'supremeAlpha'
  if (
    groupChat.admin?.toString() !== req.user._id?.toString() &&
    req.user.userRole !== 'supremeAlpha'
  ) {
    throw new ApiError(403, "You are not authorized to remove participants from pack");
  }

  const existingParticipants = groupChat.participants;

  // check if the participant that is being removed in a part of the group
  if (!existingParticipants?.includes(participantId)) {
    throw new ApiError(400, "Participant does not exist in the group chat");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: participantId, // remove participant id
      },
    },
    { new: true }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  // emit leave chat event to the removed participant
  emitSocketEvent(req, participantId, ChatEventEnum.LEAVE_CHAT_EVENT, payload);

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Participant removed successfully"));
});

const getAllChats = asyncHandler(async (req, res) => {
  const chats = await Chat.aggregate([
    {
      $match: {
        participants: { $elemMatch: { $eq: req.user._id } }, // get all chats that have logged in user as a participant
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    ...chatCommonAggregation(),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, chats || [], "User chats fetched successfully!")
    );
});

const getAllGroups = asyncHandler(async (req, res) => {
// Step 1: Find all users whose parentId is equal to req.user._id
    const users = await User.find({ parentId: req.user._id });

    // Step 2: Extract their _id values
    const userIds = users.map(user => user._id);

    // Step 3: Use aggregate to find all chats where participants' _id matches the userIds, isGroupChat is true, and apply additional common aggregation stages
    const groups = await Chat.aggregate([
      {
        $match: {
          participants: { $in: userIds },
          isGroupChat: true
        }
      },
      ...groupChatCommonAggregation() // Assuming groupChatCommonAggregation() returns additional stages
    ]);
  // const chats = await Chat.aggregate([
  //   {
  //     $match: {
  //       "participants.parentId": req.user._id, // Match where parentId is equal to user's _id
  //     },
  //   },
  //   {
  //     $sort: {
  //       updatedAt: -1,
  //     },
  //   },
  //   ...groupChatCommonAggregation(),
  // ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, groups || [], "User groups fetched successfully!")
    );
});


export {
  addNewParticipantInGroupChat,
  createAGroupChat,
  createOrGetAOneOnOneChat,
  deleteGroupChat,
  deleteOneOnOneChat,
  getAllChats,
  getGroupChatDetails,
  leaveGroupChat,
  removeParticipantFromGroupChat,
  renameGroupChat,
  searchAvailableUsers,
  getUserById,
  addUser,
  deleteUser,
  updateUser,
  getAllSupremeAlpha,
  addAlpha,
  updateAlpha,
  deleteAlpha,
  getAllAlpha,
  addOmega,
  updateOmega,
  deleteOmega,
  getAllOmega,
  getAllOTPs,
  getAllContacts,
  updateProfile,
  updateProfileImage,
  getAllGroups
};
