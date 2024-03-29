// Import necessary modules and utilities
import axios from "axios";
import { LocalStorage } from "../utils";

// Create an Axios instance for API requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true,
  timeout: 120000,
});

// Add an interceptor to set authorization header with user token before requests
apiClient.interceptors.request.use(
  function (config) {
    // Retrieve user token from local storage
    const token = LocalStorage.get("token");
    // Set authorization header with bearer token
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// API functions for different actions
const loginUser = (data: { email: string; password: string }) => {
  return apiClient.post("/users/login", data);
};

const loginUserOtp = (data: { email: string; otp: string }) => {
  return apiClient.post("/users/send-otp", data);
};

const verifyUserOtp = (data: { email: string; otp: string }) => {
  return apiClient.post("/users/verify-otp", data);
};

// const registerUser = (data: {
//   email: string;
//   password: string;
//   username: string;
// }) => {
//   return apiClient.post("/users/register", data);
// };

const getAllGroups = () => {
  return apiClient.get("/chat-app/chats/allgroups");
};

// ****************************************************SupremeAlpha CRUD API********************************************************************************//
const addUser = (data: {
  username: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  userRole: string;
  addedBy: string;
  aiStatus: string;
  gender: string;
  role: string;
}) => {
  return apiClient.post("/chat-app/chats/adduser", data);
};

const deleteUser = (userId: string) => {
  return apiClient.delete(`/chat-app/chats/deleteuser/${userId}`);
};

const updateUser = (
  userId: string,
  data: {
    name: string;
    // email: string;
    phone: string;
    gender: string;
  }
) => {
  return apiClient.patch(`/chat-app/chats/updateuser/${userId}`, data);
};

const updateProfileImage = (userId: string, imageData: FormData) => {
  return apiClient.patch(`/chat-app/chats/profileimage/${userId}`, imageData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const getAllSupremeAlphas = () => {
  return apiClient.get("/chat-app/chats/all-supreme-alphas");
};

// ****************************************************Alpha CRUD API********************************************************************************//
const addAlpha = (data: {
  username: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  userRole: string;
  addedBy: string;
  parentId: string;
  aiStatus: string;
  gender: string;
  role: string;
}) => {
  return apiClient.post("/chat-app/chats/addalpha", data);
};

const deleteAlpha = (userId: string) => {
  return apiClient.delete(`/chat-app/chats/deletealpha/${userId}`);
};

const updateAlpha = (
  userId: string,
  data: {
    name: string;
    // email: string;
    phone: string;
    gender: string;
  }
) => {
  return apiClient.patch(`/chat-app/chats/updatealpha/${userId}`, data);
};

const getAllAlphas = () => {
  return apiClient.get("/chat-app/chats/all-alphas");
};

// ****************************************************Omega CRUD API********************************************************************************//
const addOmega = (data: {
  username: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  userRole: string;
  selectedAlpha: string;
  addedBy: string;
  parentId: string;
  addedByUserRole: string;
  aiStatus: string;
  gender: string;
  role: string;
}) => {
  return apiClient.post("/chat-app/chats/addomega", data);
};

const deleteOmega = (userId: string) => {
  return apiClient.delete(`/chat-app/chats/deleteomega/${userId}`);
};

const updateOmega = (
  userId: string,
  data: {
    name: string;
    // email: string;
    phone: string;
    // addedBy: string;
    selectedAlpha: string;
    // addedByUserRole: string;
    gender: string;
  }
) => {
  return apiClient.patch(`/chat-app/chats/updateomega/${userId}`, data);
};

const getAllOmegas = () => {
  return apiClient.get("/chat-app/chats/all-omegas");
};
// ****************************************************OTP API********************************************************************************//
const getAllOTPs = () => {
  return apiClient.get("/chat-app/chats/otps");
};

// ****************************************************Contacts API********************************************************************************//
const getAllContacts = () => {
  return apiClient.get("/chat-app/chats/contacts");
};

// ****************************************************Update Profile API(Self Profile)********************************************************************************//
const updateProfile = (
  userId: string,
  data: {
    name: string;
    // email: string;
    phone: string;
    gender: string;
  }
) => {
  return apiClient.patch(`/chat-app/chats/updateprofile/${userId}`, data);
};
// **************************************************************getChatIdByParticipants******************************************************************************//
const getChatId = (participant1Id: string, participant2Id: string) => {
  return apiClient.get(
    `/chat-app/chats/getChatId/${participant1Id}/${participant2Id}`
  );
};
// ********************************************************************************************************************************************//

const logoutUser = () => {
  return apiClient.post("/users/logout");
};

const getAvailableUsers = () => {
  return apiClient.get("/chat-app/chats/users");
};

const getUserById = (userId: string) => {
  return apiClient.get(`/chat-app/chats/users/${userId}`);
};

const getUserChats = () => {
  return apiClient.get(`/chat-app/chats`);
};

const createUserChat = (receiverId: string) => {
  return apiClient.post(`/chat-app/chats/c/${receiverId}`);
};

const createGroupChat = (data: { name: string; participants: string[] }) => {
  return apiClient.post(`/chat-app/chats/group`, data);
};

const getGroupInfo = (chatId: string) => {
  return apiClient.get(`/chat-app/chats/group/${chatId}`);
};

const updateGroupName = (chatId: string, name: string) => {
  return apiClient.patch(`/chat-app/chats/group/${chatId}`, { name });
};

const deleteGroup = (chatId: string) => {
  return apiClient.delete(`/chat-app/chats/group/${chatId}`);
};

const deleteOneOnOneChat = (chatId: string) => {
  return apiClient.delete(`/chat-app/chats/remove/${chatId}`);
};

const addParticipantToGroup = (chatId: string, participantId: string) => {
  return apiClient.post(`/chat-app/chats/group/${chatId}/${participantId}`);
};

const removeParticipantFromGroup = (chatId: string, participantId: string) => {
  return apiClient.delete(`/chat-app/chats/group/${chatId}/${participantId}`);
};

const getChatMessages = (chatId: string) => {
  return apiClient.get(`/chat-app/messages/${chatId}`);
};

const sendMessage = (chatId: string, content: string, attachments: File[]) => {
  const formData = new FormData();
  if (content) {
    formData.append("content", content);
  }
  attachments?.map((file) => {
    formData.append("attachments", file);
  });
  return apiClient.post(`/chat-app/messages/${chatId}`, formData);
};

const replyMessage = (
  chatId: string,
  messageId: string,
  content: string,
  attachments: File[]
) => {
  const formData = new FormData();
  if (content) {
    formData.append("content", content);
  }
  attachments?.map((file) => {
    formData.append("attachments", file);
  });
  return apiClient.post(`/chat-app/messages/${chatId}/${messageId}`, formData);
};

const editMessage = (
  chatId: string,
  messageId: string,
  content: string
  // attachments: File[]
) => {
  // const formData = new FormData();
  // if (content) {
  //   formData.append("content", content);
  // }
  // attachments?.map((file) => {
  //   formData.append("attachments", file);
  // });
  return apiClient.put(`/chat-app/messages/${chatId}/${messageId}`, content);
};

const deleteMessage = (chatId: string, messageId: string) => {
  return apiClient.delete(`/chat-app/messages/${chatId}/${messageId}`);
};

// Export all the API functions
export {
  addParticipantToGroup,
  createGroupChat,
  createUserChat,
  deleteGroup,
  deleteOneOnOneChat,
  getAvailableUsers,
  getUserById,
  getChatMessages,
  getGroupInfo,
  getUserChats,
  loginUser,
  loginUserOtp,
  verifyUserOtp,
  logoutUser,
  removeParticipantFromGroup,
  sendMessage,
  updateGroupName,
  addUser,
  deleteUser,
  updateUser,
  getAllSupremeAlphas,
  addAlpha,
  deleteAlpha,
  updateAlpha,
  getAllAlphas,
  addOmega,
  deleteOmega,
  updateOmega,
  getAllOmegas,
  getAllOTPs,
  getAllContacts,
  updateProfile,
  updateProfileImage,
  getAllGroups,
  getChatId,
  editMessage,
  replyMessage,
  deleteMessage,
};
