import { useState } from 'react';
import copy from 'copy-to-clipboard';
import CopyIcon from '../assets/images/copy.png'; // Assuming you have a copy.svg file

export const CopyToClipboardButton = ({ text }: any) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    copy(text);
    setIsCopied(true);

    // Reset the "Copied!" message after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div onClick={handleCopyClick} className="flex items-center justify-center cursor-pointer">
      <div className="relative"> 
          {/* Your SVG image here */} 
        <div className=" inset-0 flex items-center justify-center">
          {isCopied ? (
            <span className="text-black">Copied!</span>
          ) : (
              <img src={CopyIcon} width={50} height={50}/>
          )}
        </div>
      </div>
    </div>
  );
};
