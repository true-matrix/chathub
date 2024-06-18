import React, { createContext, useContext, useState } from "react";
import { ChatMessageInterface } from "../interfaces/chat";

// Create a context to store global values
const GlobalContext = createContext<{
    activeButton: string;
    tabIndex: number;
    openGroupInfo: boolean;
    isMessageEditing: boolean;
    isMessageReplying: boolean;
    isMessageDeleting: boolean;
    messageInputFocused: boolean;
    unreadMessages: ChatMessageInterface[];
    messages: ChatMessageInterface[];
    globalOnlineStatus: string;
    setActiveButton: React.Dispatch<React.SetStateAction<string>>;
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
    setOpenGroupInfo: React.Dispatch<React.SetStateAction<boolean>>;
    setIsMessageEditing: React.Dispatch<React.SetStateAction<boolean>>;
    setIsMessageReplying: React.Dispatch<React.SetStateAction<boolean>>;
    setIsMessageDeleting: React.Dispatch<React.SetStateAction<boolean>>;
    setMessageInputFocused: React.Dispatch<React.SetStateAction<boolean>>;
    
    setUnreadMessages: React.Dispatch<React.SetStateAction<ChatMessageInterface[]>>;
    setMessages: React.Dispatch<React.SetStateAction<ChatMessageInterface[]>>;
    setGlobalOnlineStatus: React.Dispatch<React.SetStateAction<string>>;


    
}>({
    activeButton: "",
    tabIndex: -1,
    openGroupInfo: false,
    isMessageEditing: false,
    isMessageReplying: false,
    isMessageDeleting: false,
    messageInputFocused: false,
    unreadMessages: [],
    messages: [],
    globalOnlineStatus: "",
    
    setActiveButton: () => {},
    setTabIndex: () => { },
    setOpenGroupInfo: () => { },
    setIsMessageEditing: () => { },
    setIsMessageReplying: () => { },
    setIsMessageDeleting: () => { },
    setMessageInputFocused: () => { },
    
    setUnreadMessages: () => [],
    setMessages: () => [],
    setGlobalOnlineStatus: () => [],
});

// Create a hook to access the GlobalContext
const useGlobal = () => useContext(GlobalContext);

// Create a component that provides global values and functions
const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeButton, setActiveButton] = useState<string>("chat");
  const [tabIndex, setTabIndex] = useState<number>(-1);
  const [openGroupInfo, setOpenGroupInfo] = useState<boolean>(false);
  const [isMessageEditing, setIsMessageEditing] = useState<boolean>(false);
  const [isMessageReplying, setIsMessageReplying] = useState<boolean>(false);
  const [isMessageDeleting, setIsMessageDeleting] = useState<boolean>(false);
  const [messageInputFocused, setMessageInputFocused] = useState<boolean>(false);

  const [unreadMessages, setUnreadMessages] = useState<ChatMessageInterface[]>(
    []
  );
  const [messages, setMessages] = useState<ChatMessageInterface[]>([]); // To store chat messages
  const [globalOnlineStatus, setGlobalOnlineStatus] = useState<string>("offline");

  


// console.log('activeButton',activeButton);

  return (
    <GlobalContext.Provider value={{ isMessageDeleting, activeButton, tabIndex, openGroupInfo,messageInputFocused, isMessageEditing, isMessageReplying, unreadMessages, messages, globalOnlineStatus, setActiveButton, setTabIndex, setOpenGroupInfo, setIsMessageEditing, setIsMessageDeleting, setIsMessageReplying, setMessageInputFocused, setUnreadMessages, setMessages, setGlobalOnlineStatus }}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalProvider, useGlobal };
