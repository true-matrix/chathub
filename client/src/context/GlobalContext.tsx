import React, { createContext, useContext, useState } from "react";

// Create a context to store global values
const GlobalContext = createContext<{
    activeButton: string;
    tabIndex: number;
    setActiveButton: React.Dispatch<React.SetStateAction<string>>;
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
}>({
    activeButton: "",
    tabIndex: -1,
    setActiveButton: () => {},
    setTabIndex: () => {},
});

// Create a hook to access the GlobalContext
const useGlobal = () => useContext(GlobalContext);

// Create a component that provides global values and functions
const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeButton, setActiveButton] = useState<string>("chat");
  const [tabIndex, setTabIndex] = useState<number>(-1);


console.log('activeButton',activeButton);

  return (
    <GlobalContext.Provider value={{ activeButton, tabIndex, setActiveButton, setTabIndex }}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalProvider, useGlobal };
