import {
  FaceSmileIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
/// <reference lib="node" />
import { useCallback, useEffect, useRef, useState } from "react";
// import { Link, NavLink, useNavigate } from 'react-router-dom';
// import { OverlayTrigger, Tooltip } from 'react-bootstrap';
// import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
// import { Logout } from './Auth/Logout';
import { editMessage, getChatMessages, getUserChats, replyMessage, sendMessage } from "../api";
import AddChatModal from "../components/chat/AddChatModal";
import ChatItem from "../components/chat/ChatItem";
import MessageItem from "../components/chat/MessageItem";
import Typing from "../components/chat/Typing";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import nochat from "../assets/images/main-image.png"
import USER_IMG from '../assets/images/users/user.png';
// import NOTI_SOUND from '../assets/sound/notification-sound1.mp3';
// import logo from '../assets/images/wolflogo.svg'

// import chat from '../assets/images/chat.svg'
// import profile from '../assets/images/user-profile.svg'
// import setting from '../assets/images/user-setting.svg'
// import dashboard from '../assets/images/dashboard.svg'
// import logout from '../assets/images/logout.svg'
// import user_image from '../assets/images/users/avatar-1.jpg'
import EmojiPicker from 'emoji-picker-react';

import {
  ChatListItemInterface,
  ChatMessageInterface,
} from "../interfaces/chat";
import {
  LocalStorage,
  classNames,
  getChatObjectMetadata,
  requestHandler,
} from "../utils";
import { useGlobal } from "../context/GlobalContext";
import Sidebar from "./Common/Sidebar";
import { useNavigate } from "react-router-dom";
import { useIntersectionObserver } from "../commonhelper";

const CONNECTED_EVENT = "connected";
const DISCONNECT_EVENT = "disconnect";
const JOIN_CHAT_EVENT = "joinChat";
const NEW_CHAT_EVENT = "newChat";
const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";
const MESSAGE_RECEIVED_EVENT = "messageReceived";
// const MESSAGE_SEEN_EVENT = "seen";
const MESSAGE_SEEN_BY_ONE_EVENT = "seenByOne";
const MESSAGE_SEEN_BY_ALL_EVENT = "seenByAll";
const MESSAGE_EDITED_EVENT = "messageEdited";
const MESSAGE_REPLY_EVENT = "messageReplied";
const MESSAGE_DELETED_EVENT = "messageDeleted";
const LEAVE_CHAT_EVENT = "leaveChat";
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";
// const SOCKET_ERROR_EVENT = "socketError";
const UPDATE_STATUS = 'updateStatus';

// declare global {
//   interface Window {
//     activityTimeout: NodeJS.Timeout;
//   }
// }

const ChatPage = () => {

  // Import the 'useAuth' and 'useSocket' hooks from their respective contexts
  const { user } = useAuth();
  const { socket } = useSocket();
    const navigate = useNavigate();
  const { activeButton,isMessageEditing, isMessageReplying, unreadMessages, setUnreadMessages, setIsMessageEditing, setIsMessageReplying, setIsMessageDeleting, setMessageInputFocused } = useGlobal();
  const [showPicker, setShowPicker] = useState(false);
  const emojiButtonRef : any = useRef();
  // Create a reference using 'useRef' to hold the currently selected chat.
  // 'useRef' is used here because it ensures that the 'currentChat' value within socket event callbacks
  // will always refer to the latest value, even if the component re-renders.
  const currentChat = useRef<ChatListItemInterface | null>(null);

  // To keep track of the setTimeout function
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define state variables and their initial values using 'useState'
  const [isConnected, setIsConnected] = useState(false); // For tracking socket connection

  const [openAddChat, setOpenAddChat] = useState(false); // To control the 'Add Chat' modal
  const [loadingChats, setLoadingChats] = useState(false); // To indicate loading of chats
  const [loadingMessages, setLoadingMessages] = useState(false); // To indicate loading of messages

  const [chats, setChats] = useState<ChatListItemInterface[]>([]); // To store user's chats
  const [messages, setMessages] = useState<ChatMessageInterface[]>([]); // To store chat messages
  // const [unreadMessages, setUnreadMessages] = useState<ChatMessageInterface[]>(
  //   []
  // ); // To track unread messages

  const [isTyping, setIsTyping] = useState(false); // To track if someone is currently typing
  const [selfTyping, setSelfTyping] = useState(false); // To track if the current user is typing

  const [message, setMessage] = useState(""); // To store the currently typed message
  const [localSearchQuery, setLocalSearchQuery] = useState(""); // For local search functionality

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]); // To store files attached to messages
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [userChats, setUserChats] = useState<any>([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState("");
  const messageRefs: any = useRef({});
  const [onlineUsers, setOnlineUsers] = useState([])
  let isSending = false; // this flag to indicate if the message is currently being sent


  // const [allConnectedUsers, setAllConnectedUsers] = useState<any>([]);
  // const [notificationShown, setNotificationShown] = useState(false);
  useEffect(() => {
        // Fetch initial userChats data when component mounts
        const initialUserChats = LocalStorage.get('userChats');
        // const connectedUsers = LocalStorage.get('connectedUsers');
    setUserChats(initialUserChats);
    // setAllConnectedUsers(connectedUsers)

    // if (!socket) return alert("Please try after sometime! Socket not available");
    // socket?.emit("new-user-add", user._id)
    // socket?.on('get-users', (users) => {
    //   setOnlineUsers(users);
    //   console.log('onlineUsers',onlineUsers);
      
    // })

  }, [socket, isConnected]);
  
   useEffect(() => {
    // Request permission for notifications
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
   }, []);

  const scrollToPrevMessage = (id : any) => {
    const keys = Object.keys(messageRefs.current);
    const index = keys.indexOf(id);
    // console.log('keys',keys);
    // console.log('index', index);
    // console.log('id',id);
    
    if (index > 0) {
      const prevMessageId : any = keys[index];
      const prevMessageRef : any = messageRefs.current[prevMessageId];
      window.scrollTo({
        top: prevMessageRef.offsetTop,
        behavior: "smooth",
      });
      // Highlight the message for 3 seconds
      setHighlightedMessageId(prevMessageId);
      setTimeout(() => {
        setHighlightedMessageId("");
      }, 3000);
    }
    else if (index === 0) {
      // If already at the first message, scroll to the top of the page
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      // Highlight the message for 3 seconds
      setHighlightedMessageId(keys[0]);
      setTimeout(() => {
        setHighlightedMessageId("");
      }, 3000);
    }
  };

  // Function to handle ref assignment for each message
  // const setMessageRef = (id : any, element : any) => {
  //   messageRefs.current[id] = element;
  // };

  //  const showNotification = (title : any, options : any, duration = 2500) => {
  //   // Check if the browser supports notifications
  //   if (!('Notification' in window)) {
  //     console.log('This browser does not support desktop notification');
  //   } else if (Notification.permission === 'granted') {
  //     // If it's okay let's create a notification
  //     const notification = new Notification(title, options);

  //     // Close the notification after the specified duration
  //     setTimeout(() => {
  //       notification.close();
  //     }, duration);
  //   }
  // };

  // const playMessageSound = () => {
  //   const audio = new Audio(NOTI_SOUND); // Replace with the path to your sound file
  //   audio.play();
  // };

  // const [activeButton, setActiveButton] = useState("chat");

  //  const onYes = useCallback(async (id:string) => {
  //       await requestHandler(
  //     // Try to send the chat message with the given message and attached files
  //     async () =>
  //           await deleteMessage(
  //             currentChat.current?._id || "", // Chat ID or empty string if not available
  //             selectedMessage.id,
  //       ),
  //     null,
  //     // On successful message sending, clear the message input and attached files, then update the UI
  //         async () => {
  //           setIsMessageDeleting(false);
  //           navigate("/chat"); // Redirect to the login page after successful registration
  //           setMessage(""); // Clear the message input
  //           setAttachedFiles([]); // Clear the list of attached files
  //           await getChats()
  //           await getMessages();

  //           // setMessages((prev) => [res.data, ...prev]); // Update messages in the UI
  //           // updateChatLastMessage(currentChat.current?._id || "", res.data); // Update the last message in the chat
  //     },

  //     // If there's an error during the message sending process, raise an alert
  //     alert
  //     );
  //    console.log('delete=>', id);
  //    setMessages(messages.filter((message: any) => message.id !== id));
        
  //   }, []);
  //     const handleDelete = useCallback((id:string) => {
  //       confirmAlert({
  //           customUI: ({ onClose }) => {
  //               return (
  //                 <ConfirmAlert onClose={onClose} onYes={() => onYes(id)} heading="Are you sure?" subHeading={"You want to delete message?"} onCloseText="Close" onSubmitText="Delete" />
  //               );
  //           }
  //       });
  //   }, []);

  /**
   *  A  function to update the last message of a specified chat to update the chat list
   */
  const updateChatLastMessage = (
    chatToUpdateId: string,
    message: ChatMessageInterface // The new message to be set as the last message
  ) => {
    // Search for the chat with the given ID in the chats array
    const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId)!;

    // Update the 'lastMessage' field of the found chat with the new message
    chatToUpdate.lastMessage = message;

    // Update the 'updatedAt' field of the chat with the 'updatedAt' field from the message
    chatToUpdate.updatedAt = message?.updatedAt;

    // Update the state of chats, placing the updated chat at the beginning of the array
    setChats([
      chatToUpdate, // Place the updated chat first
      ...chats.filter((chat) => chat._id !== chatToUpdateId), // Include all other chats except the updated one
    ]);
  };

  const getChats = async () => {
    requestHandler(
      async () => await getUserChats(),
      setLoadingChats,
      (res) => {
        const { data } = res;
        setChats(data || []);
        LocalStorage.set("userChats", data);
      },
      alert
    );
  };

  const getMessages = async () => {
    // Check if a chat is selected, if not, show an alert
    if (!currentChat?.current?._id) return alert("No chat is selected");

    console.log('currentChat',currentChat);
    console.log('user',user);
    
    // Check if socket is available, if not, show an alert
    if (!socket) return alert("Socket not available");

    // Emit an event to join the current chat
    socket.emit(JOIN_CHAT_EVENT, currentChat.current?._id);

    // Filter out unread messages from the current chat as those will be read
    setUnreadMessages(
      unreadMessages.filter((msg) => msg.chat !== currentChat.current?._id)
    );

    // Make an async request to fetch chat messages for the current chat
    requestHandler(
      // Fetching messages for the current chat
      async () => await getChatMessages(currentChat.current?._id || ""),
      // Set the state to loading while fetching the messages
      setLoadingMessages,
      // After fetching, set the chat messages to the state if available
      (res) => {
        const { data } = res;
        setMessages(data || []);
        // if () {
        //   socket?.emit(MESSAGE_SEEN_EVENT, data?._id);
        // }

      // const updatedMessages = data && data.map((prevMessage : any) => {
      //   if (!prevMessage.seen) {
      //     return { ...prevMessage, seen: true };
      //   }
      //   return prevMessage;
      // });
      //   setMessages(updatedMessages || []);
        setMessageInputFocused(true);
      },
      // Display any error alerts if they occur during the fetch
      alert
    );
  };

  // Function to send a chat message
  const sendChatMessage = async () => {
    setShowPicker(false);
    if (isSending) return;
    isSending = true;
    // If no current chat ID exists or there's no socket connection, exit the function
    if (!currentChat.current?._id || !socket) return;

    // Emit a STOP_TYPING_EVENT to inform other users/participants that typing has stopped
    socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

    // Use the requestHandler to send the message and handle potential response or error
    if (selectedMessage && isMessageEditing) {
      await requestHandler(
      // Try to send the chat message with the given message and attached files
      async () =>
        await editMessage(
          currentChat.current?._id || "", // Chat ID or empty string if not available
          selectedMessage.id,
          message, // Actual text message
        ),
      null,
      // On successful message sending, clear the message input and attached files, then update the UI
        (res) => {
        //   setIsMessageEditing(false);
        // setSelectedMessage(null);  
        // setMessage(""); // Clear the message input
        // setAttachedFiles([]); // Clear the list of attached files
        // setMessages((prev) => [res.data, ...prev]); // Update messages in the UI
        // // updateChatLastMessage(currentChat.current?._id || "", res.data); // Update the last message in the chat
      // Find the index of the edited message in the messages array
        const editedMessageIndex = messages.findIndex((msg) => msg._id === res.data._id);
        if (editedMessageIndex !== -1) {
          // If the edited message exists in the array, replace it with the edited message data
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[editedMessageIndex] = res.data;
            return newMessages;
          });
          }
          if (res.data.edited) {
             updateChatLastMessage(currentChat.current?._id || "", res.data); // Update the last message in the chat
          }
          setIsMessageEditing(false); // Reset message editing state
          setSelectedMessage(null); // Reset selected message
          setMessage(""); // Clear the message input
          setAttachedFiles([]); // Clear the list of attached files
          isSending = false;
        },

      // If there's an error during the message sending process, raise an alert
      alert
      );
    } 
    else if (selectedMessage && isMessageReplying) {
      await requestHandler(
      // Try to send the chat message with the given message and attached files
      async () =>
        await replyMessage(
          currentChat.current?._id || "", // Chat ID or empty string if not available
          selectedMessage.id,
          message, // Actual text message
          attachedFiles // Any attached files
        ),
      null,
      // On successful message sending, clear the message input and attached files, then update the UI
        (res) => {
          setMessage(""); // Clear the message input
          setIsMessageReplying(false);
          setAttachedFiles([]); // Clear the list of attached files
          setMessages((prev) => [res.data, ...prev]); // Update messages in the UI
          updateChatLastMessage(currentChat.current?._id || "", res.data); // Update the last message in the chat
          isSending = false;
        },

      // If there's an error during the message sending process, raise an alert
      alert
      );
     }
    else {
      setSelectedMessage(null);
      await requestHandler(
      // Try to send the chat message with the given message and attached files
      async () =>
        await sendMessage(
          currentChat.current?._id || "", // Chat ID or empty string if not available
          message, // Actual text message
          attachedFiles // Any attached files
        ),
      null,
      // On successful message sending, clear the message input and attached files, then update the UI
      (res) => {
        setMessage(""); // Clear the message input
        setIsMessageReplying(false);
        setAttachedFiles([]); // Clear the list of attached files
        setMessages((prev) => [res.data, ...prev]); // Update messages in the UI
        updateChatLastMessage(currentChat.current?._id || "", res.data); // Update the last message in the chat
        isSending = false;
      },

      // If there's an error during the message sending process, raise an alert
      alert
      );
    }
  };

  const handleOnMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowPicker(false);
    // Update the message state with the current input value
    setMessage(e.target.value);

    // If socket doesn't exist or isn't connected, exit the function
    if (!socket || !isConnected) return;

    // Check if the user isn't already set as typing
    if (!selfTyping) {
      // Set the user as typing
      setSelfTyping(true);

      // Emit a typing event to the server for the current chat
      socket.emit(TYPING_EVENT, currentChat.current?._id);
    }

    // Clear the previous timeout (if exists) to avoid multiple setTimeouts from running
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Define a length of time (in milliseconds) for the typing timeout
    const timerLength = 3000;

    // Set a timeout to stop the typing indication after the timerLength has passed
    typingTimeoutRef.current = setTimeout(() => {
      // Emit a stop typing event to the server for the current chat
      socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

      // Reset the user's typing state
      setSelfTyping(false);
    }, timerLength);
  };

  // const onConnect = () => {
  //   setIsConnected(true);

  //   const userChats : any = LocalStorage.get('userChats');
  //   const updatedData = userChats.map((group : any) => {
  //       if (!group.isGroupChat) {
  //           group.participants.forEach((participant : any) => {
  //               if (participant._id !== user._id) {
  //                   participant.islogin = true;
  //               }
  //           });
  //       }
  //       return group;
  //   });
  //   LocalStorage.set('userChats', updatedData);
  // };

  // const onDisconnect = () => {
  //   setIsConnected(false);

  //   const userChats : any = LocalStorage.get('userChats');
  //   const updatedData = userChats.map((group : any) => {
  //       if (!group.isGroupChat) {
  //           group.participants.forEach((participant : any) => {
  //               if (participant._id !== user._id) {
  //                   participant.islogin = false;
  //               }
  //           });
  //       }
  //       return group;
  //   });
  //   LocalStorage.set('userChats', updatedData);
  // };

   const updateUserChats = (newUserChats : any) => {
        setUserChats(newUserChats);
  };
  // const updateConnectedUsersInLocalStorage = (connectedUsers:any) => {
  //   LocalStorage.set("connectedUsers", connectedUsers);
    
  //   };
    const sendUpdateToOtherUsers: any = (connectedUsers: any) => {
      // console.log('connectedUsers', connectedUsers);
        LocalStorage.set("connectedUsers",connectedUsers);
      // updateConnectedUsersInLocalStorage(connectedUsers);
  }
  
const updateUserOnlineStatus = (chats:any, userId:any, isOnline:any) => {
  return chats?.map((chat:any) => {
    if (!chat.isGroupChat) {
      chat.participants.forEach((participant: any) => {
        if (participant._id === userId) {
          participant.isOnline = isOnline;
        }
      });
    }
    return chat;
  });
};

  const onConnect = () => {
    const updatedConnectedUsers = JSON.parse(LocalStorage.get('connectedUsers')) || [];
  updatedConnectedUsers.push(user._id);
  LocalStorage.set('connectedUsers', JSON.stringify(updatedConnectedUsers));
  setIsConnected(true);
    setUserChats(updateUserOnlineStatus(userChats, user._id, true));
    
  // Broadcast the updated connected users list to other users
  sendUpdateToOtherUsers(updatedConnectedUsers);
    // updateConnectedUsersInLocalStorage(connectedUsers);
    
        setIsConnected(true);
        const newUserChats = userChats?.map((group:any) => {
            if (!group.isGroupChat) {
                group.participants.forEach((participant:any) => {
                    if (participant?._id !== user?._id) {
                        participant.islogin = true;
                    }
                });
            }
            return group;
        });
        updateUserChats(newUserChats);
    };

  const onDisconnect = () => {
     const connectedUsers = JSON.parse(LocalStorage.get('connectedUsers')) || [];
  const updatedConnectedUsers = connectedUsers.filter((userId:any) => userId !== user._id);
  localStorage.setItem('connectedUsers', JSON.stringify(updatedConnectedUsers));
  setIsConnected(false);

  // Broadcast the updated connected users list to other users
    sendUpdateToOtherUsers(updatedConnectedUsers);
    
    setUserChats(updateUserOnlineStatus(userChats, user._id, false));

       // Remove the disconnected user from localStorage
    //   const connectedUsers = JSON.parse(LocalStorage.get('connectedUsers')) || [];
    //   const updatedConnectedUsers = connectedUsers.filter((userId : any) => userId !== user._id);
    // updateConnectedUsersInLocalStorage(updatedConnectedUsers);
    
    //     setIsConnected(false);
        const newUserChats = userChats.map((group:any) => {
            if (!group.isGroupChat) {
                group.participants.forEach((participant:any) => {
                    if (participant._id !== user._id) {
                        participant.islogin = false;
                    }
                });
            }
            return group;
        });
        updateUserChats(newUserChats);
  };


  /**
   * Handles the "typing" event on the socket.
   */
  const handleOnSocketTyping = (chatId: string) => {
    // Check if the typing event is for the currently active chat.
    if (chatId !== currentChat.current?._id) return;

    // Set the typing state to true for the current chat.
    setIsTyping(true);
  };

  /**
   * Handles the "stop typing" event on the socket.
   */
  const handleOnSocketStopTyping = (chatId: string) => {
    // Check if the stop typing event is for the currently active chat.
    if (chatId !== currentChat.current?._id) return;

    // Set the typing state to false for the current chat.
    setIsTyping(false);
  };

  /**
   * Handles the event when a new message is received.
   */
  const onMessageReceived = (message: ChatMessageInterface) => {
    // Check if the received message belongs to the currently active chat
    // console.log('currentChat',currentChat);
    
    if (message?.chat === currentChat.current?._id) {
    //   // If not, update the list of unread messages
    //   // setUnreadMessages((prev) => [message, ...prev]);

    //   // If not, update the list of unread messages
    // setUnreadMessages((prev) => {
    //   const updatedUnreadMessages = [message, ...prev];
    //   // Store the updated unread messages in local storage
    //   LocalStorage.set("unreadMessages", updatedUnreadMessages);

    //   // Set notificationShown to true
    //   // setNotificationShown(true);
      
    //   showNotification('New WolfChat Message', {
    //   body: 'You have received a new message.',
    //   icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjPGIbqtNtn1yzk1w1cGmCgFstHk-l2NvevRgw7J7kD3uOT4sjPpn-0CVb5gPGy47z3wtZWY4M5InE_n1zBlBE_PnkDXBydBhU8RCzwijKQYiSGGB1ZJ5umDWXCd4l9TpeiQcsJW2IjwXiOoQxg2M-FhknAF-RmkCOdqJgywWOLw62wSNSCzT1W6cAiZQ0n/s1600/multiwolf100.png' // You can set an icon if needed
    //   });
      
    //    // Play message sound
    //   playMessageSound();

    //   return updatedUnreadMessages;
    // });
    // } else {
      // If it belongs to the current chat, update the messages list for the active chat
      setMessages((prev) => [message, ...prev]);
          
      // showNotification('New WolfChat Message', {
      // body: 'You have received a new message.',
      // icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjPGIbqtNtn1yzk1w1cGmCgFstHk-l2NvevRgw7J7kD3uOT4sjPpn-0CVb5gPGy47z3wtZWY4M5InE_n1zBlBE_PnkDXBydBhU8RCzwijKQYiSGGB1ZJ5umDWXCd4l9TpeiQcsJW2IjwXiOoQxg2M-FhknAF-RmkCOdqJgywWOLw62wSNSCzT1W6cAiZQ0n/s1600/multiwolf100.png' // You can set an icon if needed
      // });
      
      //  // Play message sound
      // playMessageSound();

    // socket?.emit(MESSAGE_SEEN_EVENT, message?._id);
    if (message.status === 'unread' || message.status === 'delivered') {
      // Emit message delivered event for each received message if it was unread
      socket?.emit('read', { messageId: message._id, chatId: currentChat.current?._id });
    }


      //  setMessages((prev) => {
      // // Update the status of the received message to 'messageReceived'
      // const updatedMessages = prev.map((msg) =>
      //   msg._id === message._id ? { ...msg, status: 'messageReceived' } : msg
      // );
      //    return [message, ...updatedMessages];

    //   setMessages(prev => {
    //       const updatedMessages = prev.map(message => {
    //         if(!message.seen){
    //           return {
    //             ...message,
    //             seen:true
    //         }
    //       }
    //       return message
    //       })
    //       return [message, ...updatedMessages];
    // });
    }

    // Update the last message for the chat to which the received message belongs
    updateChatLastMessage(message.chat || "", message);
  };

  const onMessageStatusUpdate = (message : ChatMessageInterface) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === message._id ? { ...msg, status: message.status } : msg
      )
    );
  };

  const markAsRead = useCallback((messageId : any) => {
    socket?.emit('readMessage', { messageId, receiverId: user._id });
  }, [user._id]);

  const { observe } = useIntersectionObserver((element:any) => {
    const messageId = element.getAttribute('data-message-id');
    markAsRead(messageId);
  });

  // Function to handle message seen by one event
const onMessageSeenByOne = (message : ChatMessageInterface) => {
  // Update the message in the messages list to reflect the seen status
  setMessages((prevMessages) =>
    prevMessages.map((msg) =>
      msg._id === message._id ? { ...msg, status: "seenByOne" } : msg
    )
  );
  };
  
  // Function to handle message seen by all event
const onMessageSeenByAll = (message : ChatMessageInterface) => {
  // Update the message in the messages list to reflect the seen status
  setMessages((prevMessages) =>
    prevMessages.map((msg) =>
      msg._id === message._id ? { ...msg, status: "seenByAll" } : msg
    )
  );
};

  const onMessageEdited = (message: ChatMessageInterface) => {
      setMessages((prev) => [message, ...prev]);

    // // Check if the received message belongs to the currently active chat
    // if (message?.chat !== currentChat.current?._id) {
    //   // If not, update the list of unread messages
    //   // setUnreadMessages((prev) => [message, ...prev]);
    //   // If not, update the list of unread messages
    // setUnreadMessages((prev) => {
    //   const updatedUnreadMessages = [message, ...prev];
    //   // Store the updated unread messages in local storage
    //   LocalStorage.set("unreadMessages", updatedUnreadMessages);
    //   return updatedUnreadMessages;
    // });
    // } else {
    //   // If it belongs to the current chat, update the messages list for the active chat
    //   setMessages((prev) => [message, ...prev]);
    // }

    // Update the last message for the chat to which the received message belongs
    // updateChatLastMessage(message.chat || "", message);
  };

  const onMessageReplied = (message: ChatMessageInterface) => {
    setMessages((prev) => [message, ...prev]);
  }

  const onMessageDeleted = (message: ChatMessageInterface) => {
      setMessages((prev) => [message, ...prev]);
    // Update the last message for the chat to which the received message belongs
      updateChatLastMessage(message.chat || "", message);
  };

  const onNewChat = (chat: ChatListItemInterface) => {
    setChats((prev) => [chat, ...prev]);
  };

  // This function handles the event when a user leaves a chat.
  const onChatLeave = (chat: ChatListItemInterface) => {
    // Check if the chat the user is leaving is the current active chat.
    if (chat._id === currentChat.current?._id) {
      // If the user is in the group chat they're leaving, close the chat window.
      currentChat.current = null;
      // Remove the currentChat from local storage.
      LocalStorage.remove("currentChat");
    }
    // Update the chats by removing the chat that the user left.
    setChats((prev) => prev.filter((c) => c._id !== chat._id));
  };

  // Function to handle changes in group name
  const onGroupNameChange = (chat: ChatListItemInterface) => {
    // Check if the chat being changed is the currently active chat
    if (chat._id === currentChat.current?._id) {
      // Update the current chat with the new details
      currentChat.current = chat;

      // Save the updated chat details to local storage
      LocalStorage.set("currentChat", chat);
    }

    // Update the list of chats with the new chat details
    setChats((prev) => [
      // Map through the previous chats
      ...prev.map((c) => {
        // If the current chat in the map matches the chat being changed, return the updated chat
        if (c._id === chat._id) {
          return chat;
        }
        // Otherwise, return the chat as-is without any changes
        return c;
      }),
    ]);
  };




  useEffect(() => {
    // Fetch the chat list from the server.
    getChats();

    // Retrieve the current chat details from local storage.
    const _currentChat = LocalStorage.get("currentChat");

    // If there's a current chat saved in local storage:
    if (_currentChat) {
      // Set the current chat reference to the one from local storage.
      currentChat.current = _currentChat;
      // If the socket connection exists, emit an event to join the specific chat using its ID.
      socket?.emit(JOIN_CHAT_EVENT, _currentChat.current?._id);
      // Fetch the messages for the current chat.
      getMessages();
    }

     // Fetch unread messages from local storage and update the unread count
  const _unreadMessages = LocalStorage.get("unreadMessages");
  setUnreadMessages(_unreadMessages || []);


    setMessageInputFocused(true);
    
    // An empty dependency array ensures this useEffect runs only once, similar to componentDidMount.
  }, []);



  useEffect(() => {
    // getMessages();

    const lastMessageFromOtherUser =
      currentChat?.current?.lastMessage?.sender._id !== user._id;

    if (lastMessageFromOtherUser) {
      socket?.emit("markMessagesAsSeen", {
        conversationId: currentChat.current?._id,
        userId: currentChat?.current?.lastMessage?.sender._id,
      });
    }

    socket?.on('messagesSeen', ({ conversationId }) => {
      if (currentChat?.current?._id === conversationId) {
        updateMessagesAsSeen();
      }
    });

    return () => {
      socket?.off('messagesSeen');
    };
  }, [socket, currentChat?.current?._id]);

  const updateMessagesAsSeen = () => {
    const updatedMessages = messages.map(message => ({
      ...message,
      seen: true,
    }));
    setMessages(updatedMessages);
    LocalStorage.set('currentChat', JSON.stringify({
      ...currentChat.current,
      messages: updatedMessages,
    }));
  };

 
  // This useEffect handles the setting up and tearing down of socket event listeners.
  useEffect(() => {
    // If the socket isn't initialized, we don't set up listeners.
    if (!socket) return;

    // Set up event listeners for various socket events:
    // Listener for when the socket connects.
    socket.on(CONNECTED_EVENT, onConnect);
    socket.on('connectedUsers', sendUpdateToOtherUsers);
    socket.emit("new-user-add", user._id)
    socket.on('get-users', (users) => {
      setOnlineUsers(users);
    })
    // Listener for when the socket disconnects.
    socket.on(DISCONNECT_EVENT, onDisconnect);
    // Listener for when a user is typing.
    socket.on(TYPING_EVENT, handleOnSocketTyping);
    // Listener for when a user stops typing.
    socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    // Listener for when a new message is received.
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    socket.on('messageStatusUpdate', onMessageStatusUpdate);
    socket.on(MESSAGE_SEEN_BY_ONE_EVENT, onMessageSeenByOne);
    socket.on(MESSAGE_SEEN_BY_ALL_EVENT, onMessageSeenByAll)
    // Listener for when a message is edited.
    socket.on(MESSAGE_EDITED_EVENT, onMessageEdited);
    // Listener for when a message is edited.
    socket.on(MESSAGE_REPLY_EVENT, onMessageReplied);
    // Listener for when a message is deleted.
    socket.on(MESSAGE_DELETED_EVENT, onMessageDeleted);
    // Listener for the initiation of a new chat.
    socket.on(NEW_CHAT_EVENT, onNewChat);
    // Listener for when a user leaves a chat.
    socket.on(LEAVE_CHAT_EVENT, onChatLeave);
    // Listener for when a group's name is updated.
    socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);

   const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // socket.emit(UPDATE_STATUS, 'away');
        (window as any).activityTimeout = setTimeout(() => socket.emit(UPDATE_STATUS, 'away'), 60000);

      } else {
        clearTimeout((window as any).activityTimeout);
        socket.emit(UPDATE_STATUS, 'online');

      }
    };

    const handleWindowBlur = () => {
        // socket.emit(UPDATE_STATUS, 'away');
        (window as any).activityTimeout = setTimeout(() => socket.emit(UPDATE_STATUS, 'away'), 60000);
      
    };

    const handleWindowFocus = () => {
        clearTimeout((window as any).activityTimeout);
        socket.emit(UPDATE_STATUS, 'online');

    };

    const handleWindowClose = () => {

      socket.emit(UPDATE_STATUS, 'away');


    };

    const resetActivityTimeout = () => {
      clearTimeout((window as any).activityTimeout);
        socket.emit(UPDATE_STATUS, 'online');
      (window as any).activityTimeout = setTimeout(() => {
        socket.emit(UPDATE_STATUS, 'away');

      }, 60000); // 60 secs of inactivity
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('beforeunload', handleWindowClose);
    document.addEventListener('mousemove', resetActivityTimeout);
    document.addEventListener('keydown', resetActivityTimeout);


    // When the component using this hook unmounts or if `socket` or `chats` change:
    return () => {
      // Remove all the event listeners we set up to avoid memory leaks and unintended behaviors.
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      socket.off('connectedUsers', sendUpdateToOtherUsers);

      socket.off(TYPING_EVENT, handleOnSocketTyping);
      socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off('messageStatusUpdate', onMessageStatusUpdate);
      socket.off(MESSAGE_SEEN_BY_ONE_EVENT, onMessageSeenByOne);
      socket.off(MESSAGE_SEEN_BY_ALL_EVENT, onMessageSeenByAll)
      socket.off(MESSAGE_EDITED_EVENT, onMessageEdited);
      socket.off(MESSAGE_REPLY_EVENT, onMessageReplied);
      socket.off(MESSAGE_DELETED_EVENT, onMessageDeleted);
      socket.off(NEW_CHAT_EVENT, onNewChat);
      socket.off(LEAVE_CHAT_EVENT, onChatLeave);
      socket.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('beforeunload', handleWindowClose);
      document.removeEventListener('mousemove', resetActivityTimeout);
      document.removeEventListener('keydown', resetActivityTimeout);
      // socket.disconnect();?]
    };

    // Note:
    // The `chats` array is used in the `onMessageReceived` function.
    // We need the latest state value of `chats`. If we don't pass `chats` in the dependency array,
    // the `onMessageReceived` will consider the initial value of the `chats` array, which is empty.
    // This will not cause infinite renders because the functions in the socket are getting mounted and not executed.
    // So, even if some socket callbacks are updating the `chats` state, it's not
    // updating on each `useEffect` call but on each socket call.
  }, [socket, chats]);

  // Emoji
    const togglePicker = () => {
    setShowPicker(prevState => !prevState);
  };

  const handleOutsideClick = (event:any) => {
    if (emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) {
      setShowPicker(false);
    }
  };

  // Add event listener to handle clicks outside the emoji button and picker
  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const onEmojiClick = (emojiObject:any) => {
    // console.log('Emoji clicked:', emojiObject);
    setMessage((prevInput) => prevInput + emojiObject?.emoji);
  };

  const handleMessageClick = (message: any) => {
    setSelectedMessage(message);
    if (message) {
      setMessage(message.content);
    }
  };

  const handleMessageReply = (message: any) => {
    setSelectedMessage(message);
    if (message) {
      setMessage('');
    }
  };

  const handleDeleteMessage = async (message: any) => {
    if (message) {
            setIsMessageDeleting(false);
            navigate("/chat"); // Redirect to the login page after successful registration
            setMessage(""); // Clear the message input
            setAttachedFiles([]); // Clear the list of attached files
            await getChats()
            await getMessages();
    }
  }


  console.log('selected msg',selectedMessage);
  // console.log('isMessageEditing',isMessageEditing);
  // const isChatOnline = userChats.find((group:any) => group._id === chat._id)?.participants.some((participant:any) => participant._id !== user._id && participant.islogin) || false;
  const handleCloseEditing = () => {
    setIsMessageEditing(false);
    setSelectedMessage(null); // Reset selected message
    setMessage("");
  };

  const handleCloseReplying = () => {
    setIsMessageReplying(false);
    setSelectedMessage(null); // Reset selected message
    setMessage("");
  };

  // const checkOnlineStatus = (chat: any) => {
  //   if (!chat.isGroupChat) {
  //     const chatMember = chat.participants.find((member: any) => member?._id !== user?._id);
  //     const online = onlineUsers?.find((user : any)=> user?.userId === chatMember?._id)
  //   return (online || online !== undefined ) ? true : false
      
  //   }
  // }

 const checkOnlineStatus = (chat : any) => {
    if (!chat.isGroupChat) {
      const chatMember = chat.participants.find((member: any) => member?._id !== user?._id);
      const onlineUser : any = onlineUsers.find((u: any) => u.userId === chatMember?._id);
      return onlineUser ? onlineUser.status : 'offline';
    }
    return 'offline';
  };

  return (
    <>
      {/* {isMessageDeleting && handleDelete(selectedMessage?.id)} */}
      <AddChatModal
        open={openAddChat}
        onClose={() => {
          setOpenAddChat(false);
        }}
        onSuccess={() => {
          getChats();
        }}
      />

      <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0 overflow-hidden"> 
      {/* Left Sidebar Tabs */}
      <Sidebar/>

      {/* Chat Sidebar */}
      {activeButton === "chat" && <div className="w-1/3 relative ring-white overflow-y-auto px-0">
          <div className="z-10 w-full sticky top-0 bg-white text-sm flex justify-between items-center gap-3 user-searchbar">
            <Input
              placeholder="Search user or pack... "
              value={localSearchQuery}
              onChange={(e) =>
                setLocalSearchQuery(e.target.value.toLowerCase())
              }
            />
            <button
              onClick={() => setOpenAddChat(true)}
              className="rounded-xl border-none bg-primary text-white text-sm py-3 px-4 flex flex-shrink-0"
            >
               New chat
            </button>
          </div>
          {loadingChats ? (
            <div className="flex justify-center items-center h-[calc(100%-88px)]">
              <Typing />
            </div>
          ) : (
            // Iterating over the chats array
            [...chats]
              // Filtering chats based on a local search query
              .filter((chat) =>
                // If there's a localSearchQuery, filter chats that contain the query in their metadata title
                localSearchQuery
                  ? getChatObjectMetadata(chat, user!)
                      .title?.toLocaleLowerCase()
                      ?.includes(localSearchQuery)
                  : // If there's no localSearchQuery, include all chats
                    true
              )
                .map((chat) => {
                return (
                  <ChatItem
                    chat={chat}
                    isOnline={checkOnlineStatus(chat)}
                    // isOnline={userChats?.find((group: any) => group._id === chat._id)?.participants.some((participant: any) => participant._id !== user._id && participant.islogin) || false}
                    isActive={chat._id === currentChat.current?._id}
                    unreadCount={
                      unreadMessages.filter((n) => n.chat === chat._id).length
                    }
                    onClick={(chat) => {
                      if (
                        currentChat.current?._id &&
                        currentChat.current?._id === chat._id
                      )
                        return;
                      LocalStorage.set("currentChat", chat);
                      LocalStorage.set("unreadMessages", []);
                      currentChat.current = chat;
                      setMessage("");
                      getMessages();
                      setMessageInputFocused(true);
                    }}
                    key={chat._id}
                    onChatDelete={(chatId) => {
                      setChats((prev) =>
                        prev.filter((chat) => chat._id !== chatId)
                      );
                      if (currentChat.current?._id === chatId) {
                        currentChat.current = null;
                        LocalStorage.remove("currentChat");
                      }
                    }}
                  />
                );
              })
          )}
        </div>}

        {/* Chat Body */}
        {activeButton === "chat" && <div className="w-2/3 border-l-[0.1px] border-secondary chat-background relative">
          {currentChat.current && currentChat.current?._id ? (
            <>
              <div className="p-4 py-3 sticky top-0 z-20 flex justify-between items-center w-full border-b-[0.1px] border-secondary user-chat-header">
                <div className="flex justify-start items-center w-max gap-3">
                  {currentChat.current.isGroupChat ? (
                    // Group Chat Header
                    <div className="w-12 relative h-12 flex-shrink-0 flex justify-start items-center flex-nowrap">
                      <img
                        src={getChatObjectMetadata(currentChat.current, user!).avatar}
                        className="w-12 h-12 border-[1px] border-green rounded-full absolute outline outline-1 outline-white"
                      />
                    </div>
                    // <div className="w-12 relative h-12 flex-shrink-0 flex justify-start items-center flex-nowrap">
                    //   {currentChat.current.participants
                    //     .slice(0, 3)
                    //     .map((participant, i) => {
                    //       return (
                    //         <img
                    //           key={participant._id}
                    //           src={participant.avatar.url}
                    //           className={classNames(
                    //             "w-9 h-9 border-[1px] border-white rounded-full absolute outline outline-1 outline-white",
                    //             i === 0
                    //               ? "left-0 z-30"
                    //               : i === 1
                    //               ? "left-2 z-20"
                    //               : i === 2
                    //               ? "left-4 z-10"
                    //               : ""
                    //           )}
                    //         />
                    //       );
                    //     })}
                    // </div>
                  ) : (
                    // Single Chat Header
                    <img
                      className="h-14 w-14 rounded-full flex flex-shrink-0 object-cover"
                      src={
                        getChatObjectMetadata(currentChat.current, user!).avatar
                      }
                    />
                  )}
                  <div>
                    <p className="font-bold">
                      {getChatObjectMetadata(currentChat.current, user!).title}
                    </p>
                    <small className="text-zinc-400">
                      {
                        getChatObjectMetadata(currentChat.current, user!)
                          .description
                      }
                    </small>
                  </div>
                  {/* {currentChat.current.isGroupChat && (
                        <button onClick={()=> setOpenGroupInfo(true)} className="flex p-2.5 bg-yellow-500 rounded-xl hover:rounded-3xl hover:bg-yellow-600 transition-all duration-300 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        </button>
                    )} */}
                </div>
              </div>
              
              <div
                className={classNames(
                  "p-8 overflow-y-auto flex flex-col-reverse gap-6 w-full",
                  attachedFiles.length > 0
                    ? "h-[calc(100vh-280px)]"
                    : "h-[calc(100vh-176px)]"
                )}
                id="message-window"
              >
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-[calc(100%-88px)]">
                    <Typing />
                  </div>
                ) : (
                  <>
                    {isTyping ? <Typing /> : null}
                    {messages?.map((msg) => {
                      return (
                        <MessageItem
                          key={msg._id}
                          data-message-id={msg._id}
                          messageRef={(element:any) => observe(element)}
                          isOwnMessage={msg.sender?._id === user?._id}
                          isGroupChatMessage={currentChat.current?.isGroupChat}
                          message={msg}
                          onMessageClick={handleMessageClick}
                          onMessageReply={handleMessageReply}
                          onMessageDelete={() => handleDeleteMessage(msg._id)}
                          // messageRef={(element:any) => setMessageRef(msg.parentMessage, element)} 
                          scrollToPrevMessage={scrollToPrevMessage} 
                          highlightedMessageId={highlightedMessageId}
                          // onSeen={handleSeen}
                          onSeen={msg.seen}
                        />
                      );
                    })}
                  </>
                )}
              </div>



              {attachedFiles.length > 0 ? (
                <div className="image-gallery flex gap-2 p-3 justify-start w-100 flex-wrap">
                  {attachedFiles.map((file, i) => {
                    return (
                      <div
                        key={i}
                        className="group w-24 h-24 relative aspect-square rounded-xl cursor-pointer"
                      >
                        <div className="absolute inset-0 flex justify-center items-center w-full h-full bg-white/10 shadow-lg border-green-400 group-hover:opacity-100 rounded-lg border transition-opacity ease-in-out duration-150">
                          <button
                            onClick={() => {
                              setAttachedFiles(
                                attachedFiles.filter((_, ind) => ind !== i)
                              );
                            }}
                            className="absolute -top-2 -right-2"
                          >
                            <XCircleIcon className="h-5 w-5 text-red-500 bg-white rounded-full" />
                          </button>
                        </div>
                        <img
                          className="h-full rounded-xl w-full object-cover"
                          src={URL.createObjectURL(file)}
                          alt="attachment"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}



                {isMessageEditing && <div className="edit-message-container flex gap-2 p-3 justify-start w-100 flex-wrap">   
                    <div className="edit-message">

                  <button className="absolute top-2 right-2" onClick={() => handleCloseEditing()}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5 text-red-500 bg-white rounded-full"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg>
                      </button>

                      <div className="flex align-center mb-2">
                          <h6 className="font-bold text-green-900	text-sm mr-1">Edit Message</h6> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-5 h-5 mr-2 edit-icon"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.  58 13.42a4 4 0 00-.885 1.343z"></path></svg>
                      </div>
                  
                        
                        <p className="truncate-1 text-sm">{selectedMessage.content}</p>
                    </div> 
                </div> }
                


                  {/* reply */}
                {isMessageReplying && (<div className="reply-message-container flex flex-row gap-1 p-3 justify-start w-100 ">   
                    <div>
                      <img src={selectedMessage?.data?.sender?.avatar?.url ? selectedMessage?.data?.sender?.avatar?.url : USER_IMG} className="h-16w-10 h-10 rounded-full" />
                    </div>
                    <div className="reply-message"> 
                      <button className="absolute top-2 right-2" onClick={() => handleCloseReplying()}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5 text-red-500 bg-white rounded-full"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg>
                      </button>

                      <div className="flex align-center mb-2">
                    <h6 className="font-bold text-green-900	text-sm mr-1">Reply to {selectedMessage?.data?.sender?.name}</h6> 
                          <svg className="mt-1" width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M3.56992 1.21932C3.86055 0.970213 3.89421 0.53267 3.6451 0.242043C3.39599 -0.0485844 2.95844 -0.0822416 2.66782 0.166868L0.242031 2.24611C0.187449 2.2929 0.141054 2.34737 0.103935 2.40728C0.0406085 2.50921 0.002999 2.62879 0.000171731 2.75694C7.16258e-05 2.76144 1.53714e-05 2.76593 2.74262e-06 2.77042C6.65533e-07 2.77112 0 2.77182 0 2.77252C0 2.96871 0.0815179 3.14587 0.212531 3.27196L2.62879 5.68821C2.89945 5.95888 3.33829 5.95888 3.60895 5.68821C3.87962 5.41755 3.87962 4.97871 3.60895 4.70805L2.36651 3.4656H8.66145C10.6745 3.4656 12.3942 5.11911 12.4725 7.13126L12.4725 7.13134C12.5556 9.25659 10.7895 11.0895 8.66145 11.0895H2.77163C2.38886 11.0895 2.07855 11.3998 2.07855 11.7826C2.07855 12.1654 2.38886 12.4757 2.77163 12.4757H8.66145C11.5742 12.4757 13.9714 9.99072 13.8576 7.07731C13.7503 4.32105 11.4189 2.07944 8.66145 2.07944H2.56645L3.56992 1.21932ZM13.8576 7.07731L13.8576 7.07723L13.1651 7.10428L13.8576 7.07731Z" fill="#14532D"/>
                          </svg>


                      </div> 
                  <p className="truncate-1 text-sm">{selectedMessage?.content ? selectedMessage?.content : <img
                        className="h-8 w-8 object-contain"
                        src={selectedMessage.data.attachments[0].url}
                        alt="msg_img"
                      />}</p>
                    </div> 
                </div>)}



                

              <div className="sticky top-full p-4 flex justify-between items-center w-full gap-2 border-t-[0.1px] border-secondary">
                <input
                  hidden
                  id="attachments"
                  type="file"
                  value=""
                  multiple
                  max={5}
                  onChange={(e) => {
                    if (e.target.files) {
                      setAttachedFiles([...e.target.files]);
                    }
                  }}
                />
                <label
                  htmlFor="attachments"
                  className="p-4 rounded-full bg-white hover:bg-primary cursor-pointer "
                  onClick={() =>setShowPicker(false)}
                >
                  <PaperClipIcon className="w-6 h-6" />
                </label>

                <button
                  className="p-4 rounded-full bg-white hover:bg-primary cursor-pointer" 
                  onClick={togglePicker}
                >
                  <FaceSmileIcon className="w-6 h-6" />
                </button>
                {showPicker && (
                <div>
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}

                <Input
                  placeholder="Message"
                  value={message}
                  onChange={handleOnMessageChange}
                  onKeyDown={(e) => {
                    if ((message || attachedFiles.length > 0) && e.key === "Enter") {
                      sendChatMessage();
                    }
                  }}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!message && attachedFiles.length <= 0}
                  // className="p-4 rounded-full bg-success text-white cursor-pointer" 
                  className={`p-4 rounded-full ${!message && attachedFiles.length <= 0 ? 'bg-secondary' : 'bg-success'} text-white cursor-pointer`}
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center p-5"> 
              <img src={nochat} alt="" />
              <p>Start Your Chat Journey With WolfPack</p>
            </div>
          )}
        </div>}
      </div>
    </>
  );
};

export default ChatPage;
