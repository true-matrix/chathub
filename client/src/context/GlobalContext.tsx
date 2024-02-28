import React, { createContext, useContext, useState } from "react";

// Create a context to store global values
const GlobalContext = createContext<{
    activeButton: string;
    setActiveButton: React.Dispatch<React.SetStateAction<string>>;
}>({
    activeButton: "",
    setActiveButton: () => {},
});

// Create a hook to access the GlobalContext
const useGlobal = () => useContext(GlobalContext);

// Create a component that provides global values and functions
const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeButton, setActiveButton] = useState<string>("chat");

console.log('activeButton',activeButton);

  return (
    <GlobalContext.Provider value={{ activeButton, setActiveButton }}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalProvider, useGlobal };
