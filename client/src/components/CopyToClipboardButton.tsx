import { useState } from 'react';
import copy from 'copy-to-clipboard';

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
          {/* Your SVG path here */} 
        <div className=" inset-0 flex items-center justify-center">
          <span className="text-black">
            {isCopied ? 'Copied!' : 'Copy OTP'}
          </span>
        </div>
      </div>
    </div>
  );
};
