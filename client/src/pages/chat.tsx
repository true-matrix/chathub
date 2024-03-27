import {
  FaceSmileIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
/// <reference lib="node" />
import { useEffect, useRef, useState } from "react";
// import { Link, NavLink, useNavigate } from 'react-router-dom';
// import { OverlayTrigger, Tooltip } from 'react-bootstrap';
// import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
// import { Logout } from './Auth/Logout';
import { editMessage, getChatMessages, getUserChats, sendMessage } from "../api";
import AddChatModal from "../components/chat/AddChatModal";
import ChatItem from "../components/chat/ChatItem";
import MessageItem from "../components/chat/MessageItem";
import Typing from "../components/chat/Typing";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import nochat from "../assets/images/main-image.png"
// import USER_IMG from '../assets/images/users/user.png';
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

const CONNECTED_EVENT = "connected";
const DISCONNECT_EVENT = "disconnect";
const JOIN_CHAT_EVENT = "joinChat";
const NEW_CHAT_EVENT = "newChat";
const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";
const MESSAGE_RECEIVED_EVENT = "messageReceived";
const MESSAGE_EDITED_EVENT = "messageEdited";
const LEAVE_CHAT_EVENT = "leaveChat";
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";
// const SOCKET_ERROR_EVENT = "socketError";

const ChatPage = () => {

  // Import the 'useAuth' and 'useSocket' hooks from their respective contexts
  const { user } = useAuth();
  const { socket } = useSocket();
  const { activeButton,isMessageEditing, setIsMessageEditing } = useGlobal();
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
  const [unreadMessages, setUnreadMessages] = useState<ChatMessageInterface[]>(
    []
  ); // To track unread messages

  const [isTyping, setIsTyping] = useState(false); // To track if someone is currently typing
  const [selfTyping, setSelfTyping] = useState(false); // To track if the current user is typing

  const [message, setMessage] = useState(""); // To store the currently typed message
  const [localSearchQuery, setLocalSearchQuery] = useState(""); // For local search functionality

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]); // To store files attached to messages
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [userChats, setUserChats] = useState<any>([]);
  useEffect(() => {
        // Fetch initial userChats data when component mounts
        const initialUserChats = LocalStorage.get('userChats');
        setUserChats(initialUserChats);
    }, [socket,isConnected]);
  // const [activeButton, setActiveButton] = useState("chat");

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
    if (!currentChat.current?._id) return alert("No chat is selected");

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
      },
      // Display any error alerts if they occur during the fetch
      alert
    );
  };

  // Function to send a chat message
  const sendChatMessage = async () => {
    setShowPicker(false);
    // If no current chat ID exists or there's no socket connection, exit the function
    if (!currentChat.current?._id || !socket) return;

    // Emit a STOP_TYPING_EVENT to inform other users/participants that typing has stopped
    socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

    // Use the requestHandler to send the message and handle potential response or error
    if (selectedMessage) {
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
        setAttachedFiles([]); // Clear the list of attached files
        setMessages((prev) => [res.data, ...prev]); // Update messages in the UI
        updateChatLastMessage(currentChat.current?._id || "", res.data); // Update the last message in the chat
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

    const onConnect = () => {
        setIsConnected(true);
        const newUserChats = userChats.map((group:any) => {
            if (!group.isGroupChat) {
                group.participants.forEach((participant:any) => {
                    if (participant._id !== user._id) {
                        participant.islogin = true;
                    }
                });
            }
            return group;
        });
        updateUserChats(newUserChats);
    };

    const onDisconnect = () => {
        setIsConnected(false);
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
    if (message?.chat !== currentChat.current?._id) {
      // If not, update the list of unread messages
      // setUnreadMessages((prev) => [message, ...prev]);
      // If not, update the list of unread messages
    setUnreadMessages((prev) => {
      const updatedUnreadMessages = [message, ...prev];
      // Store the updated unread messages in local storage
      LocalStorage.set("unreadMessages", updatedUnreadMessages);
      return updatedUnreadMessages;
    });
    } else {
      // If it belongs to the current chat, update the messages list for the active chat
      setMessages((prev) => [message, ...prev]);
    }

    // Update the last message for the chat to which the received message belongs
    updateChatLastMessage(message.chat || "", message);
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


  // Function to handle button click
  // const handleButtonClick = (buttonId : any) => {  
  //   // if(buttonId !== "chat") {
  //   //     setActiveButton(buttonId === activeButton ? "chat" : buttonId);
  //   // }
  //   if(buttonId === "chat"){
  //       setActiveButton(buttonId);
  //   }
  //   if(buttonId === "contacts" || buttonId === "profile" || buttonId === "settings"){
  //     setActiveButton(buttonId);
  //   }
  //   else {
  //       setActiveButton("chat")
  //   }
  // };


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


    // An empty dependency array ensures this useEffect runs only once, similar to componentDidMount.
  }, []);

  // This useEffect handles the setting up and tearing down of socket event listeners.
  useEffect(() => {
    // If the socket isn't initialized, we don't set up listeners.
    if (!socket) return;

    // Set up event listeners for various socket events:
    // Listener for when the socket connects.
    socket.on(CONNECTED_EVENT, onConnect);
    // Listener for when the socket disconnects.
    socket.on(DISCONNECT_EVENT, onDisconnect);
    // Listener for when a user is typing.
    socket.on(TYPING_EVENT, handleOnSocketTyping);
    // Listener for when a user stops typing.
    socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    // Listener for when a new message is received.
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    // Listener for when a message is edited.
    socket.on(MESSAGE_EDITED_EVENT, onMessageEdited);
    // Listener for the initiation of a new chat.
    socket.on(NEW_CHAT_EVENT, onNewChat);
    // Listener for when a user leaves a chat.
    socket.on(LEAVE_CHAT_EVENT, onChatLeave);
    // Listener for when a group's name is updated.
    socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);

    // When the component using this hook unmounts or if `socket` or `chats` change:
    return () => {
      // Remove all the event listeners we set up to avoid memory leaks and unintended behaviors.
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      socket.off(TYPING_EVENT, handleOnSocketTyping);
      socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off(MESSAGE_EDITED_EVENT, onMessageEdited);
      socket.off(NEW_CHAT_EVENT, onNewChat);
      socket.off(LEAVE_CHAT_EVENT, onChatLeave);
      socket.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
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
  console.log('selected msg',selectedMessage);
  // console.log('isMessageEditing',isMessageEditing);
  // const isChatOnline = userChats.find((group:any) => group._id === chat._id)?.participants.some((participant:any) => participant._id !== user._id && participant.islogin) || false;
  const handleCloseEditing = () => {
    setIsMessageEditing(false);
    setSelectedMessage(null); // Reset selected message
    setMessage("");
  };
  return (
    <>
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
                    isOnline={userChats.find((group:any) => group._id === chat._id)?.participants.some((participant:any) => participant._id !== user._id && participant.islogin) || false}
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
                          isOwnMessage={msg.sender?._id === user?._id}
                          isGroupChatMessage={currentChat.current?.isGroupChat}
                          message={msg}
                          onMessageClick={handleMessageClick}
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
                    if (e.key === "Enter") {
                      sendChatMessage();
                    }
                  }}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!message && attachedFiles.length <= 0}
                  className="p-4 rounded-full bg-success text-white cursor-pointer" 
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
