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

const updateUser = (userId: string, data: {
  name: string;
  // email: string;
  phone: string; 
  gender: string;
}) => {
  return apiClient.patch(`/chat-app/chats/updateuser/${userId}`, data);
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

const updateAlpha = (userId: string, data: {
  name: string;
  // email: string;
  phone: string; 
  gender: string;
}) => {
  return apiClient.patch(`/chat-app/chats/updatealpha/${userId}`, data);
};

const getAllAlphas = () => {
  return apiClient.get("/chat-app/chats/all-alphas");
};
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
  getAllAlphas
};
