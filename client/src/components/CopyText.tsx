import { ClipboardIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

const CopyText = ( {textToCopy}  : any) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);

    // Reset the copy success message after 2 seconds
    setTimeout(() => {
      setCopySuccess(false);
    }, 1500);
  };

  return (
      <div>
          {copySuccess ? 
              <span style={{ marginLeft: '5px', color: 'green' }}>✔Copied!</span>
              : (<button onClick={copyToClipboard}><ClipboardIcon className="w-5 h-5 mr-2" />
                    <span>Copy</span>
                </button>)
          }
    </div>
  );
};

export default CopyText;
