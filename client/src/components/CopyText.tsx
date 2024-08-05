import { DocumentDuplicateIcon } from '@heroicons/react/20/solid';
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
      <div className=' hover:text-green-700 w-100'>
          {copySuccess ? 
              <span style={{ marginLeft: '5px', color: 'green' }}>✔Copied!</span>
              : (<button onClick={copyToClipboard} className=' flex items-center'> <DocumentDuplicateIcon className="w-5 h-5 mr-2 text-gray-600" />
                    <span>Copy</span>
                </button>)
          }
    </div>
  );
};

export default CopyText;
