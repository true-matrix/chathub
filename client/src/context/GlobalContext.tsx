import React, { createContext, useContext, useState } from "react";

// Create a context to store global values
const GlobalContext = createContext<{
    activeButton: string;
    tabIndex: number;
    openGroupInfo: boolean;
    isMessageEditing: boolean;
    isMessageReplying: boolean;
    isMessageDeleting: boolean;
    messageInputFocused: boolean;
    setActiveButton: React.Dispatch<React.SetStateAction<string>>;
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
    setOpenGroupInfo: React.Dispatch<React.SetStateAction<boolean>>;
    setIsMessageEditing: React.Dispatch<React.SetStateAction<boolean>>;
    setIsMessageReplying: React.Dispatch<React.SetStateAction<boolean>>;
    setIsMessageDeleting: React.Dispatch<React.SetStateAction<boolean>>;
    setMessageInputFocused: React.Dispatch<React.SetStateAction<boolean>>;
    
}>({
    activeButton: "",
    tabIndex: -1,
    openGroupInfo: false,
    isMessageEditing: false,
    isMessageReplying: false,
    isMessageDeleting: false,
    messageInputFocused: false,
    setActiveButton: () => {},
    setTabIndex: () => { },
    setOpenGroupInfo: () => { },
    setIsMessageEditing: () => { },
    setIsMessageReplying: () => { },
    setIsMessageDeleting: () => { },
    setMessageInputFocused: () => { },
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


// console.log('activeButton',activeButton);

  return (
    <GlobalContext.Provider value={{ isMessageDeleting, activeButton, tabIndex, openGroupInfo,messageInputFocused, isMessageEditing, isMessageReplying, setActiveButton, setTabIndex, setOpenGroupInfo, setIsMessageEditing, setIsMessageDeleting, setIsMessageReplying, setMessageInputFocused }}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalProvider, useGlobal };
