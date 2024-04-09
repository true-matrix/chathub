import React, { useEffect, useRef } from "react";
import { classNames } from "../utils";
import { useGlobal } from "../context/GlobalContext";

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => {
  const { messageInputFocused, setMessageInputFocused } = useGlobal();
  // const handleFocus = () => {
  //   if (!messageInputFocused) {
  //     setMessageInputFocused(true);
  //   }
  // }
  const inputRef = useRef<HTMLInputElement>(null);
   useEffect(() => {
    if (messageInputFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messageInputFocused]);

  // Function to handle click event and set focus state to true
  const handleClick = () => {
    setMessageInputFocused(true);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  return (
    <input
      {...props}
      ref={inputRef}
      onFocus={handleClick}
      className={classNames(
        "block w-full rounded-xl outline outline-[1px] outline-zinc-400 border-0 py-3 px-4 font-light",
        props.className || ""
      )}
    />
  );
};

export default Input;
