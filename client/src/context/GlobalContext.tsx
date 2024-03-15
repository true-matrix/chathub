import React, { createContext, useContext, useState } from "react";

// Create a context to store global values
const GlobalContext = createContext<{
    activeButton: string;
    tabIndex: number;
    openGroupInfo: boolean;
    setActiveButton: React.Dispatch<React.SetStateAction<string>>;
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
    setOpenGroupInfo: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    activeButton: "",
    tabIndex: -1,
    openGroupInfo: false,
    setActiveButton: () => {},
    setTabIndex: () => { },
    setOpenGroupInfo: () => { },
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



console.log('activeButton',activeButton);

  return (
    <GlobalContext.Provider value={{ activeButton, tabIndex, openGroupInfo, setActiveButton, setTabIndex, setOpenGroupInfo }}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalProvider, useGlobal };
