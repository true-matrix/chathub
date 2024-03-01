import React from 'react';
interface IConfirmAlert {
  heading: string;
  subHeading?: string;
  onYes: (payload?: any) => void;
  onClose: () => void;
  onSubmitText: string;
  onCloseText: string;
}
export const ConfirmAlert: React.FC<any> = (props: IConfirmAlert) => {

  return (

    <div className='shadow-lg p-0 overflow-hidden bg-white logout-poppup-modal-container'> 
      <div className='modal-header-colored'>
          <div className='modal-header d-block'> 
            <h1 className='text-white text-center m-0 fs-3'>{props?.heading}</h1>
          </div>
          <div className="confirmBody p-3">
          <p className='p-4'>{props?.subHeading}</p>
          <div className="confirmFooter btn-right">
          <button className="close" onClick={props.onClose}>{props.onCloseText}</button>
          <button
            className="logout"
            onClick={() => {
              props.onYes(props);
              props.onClose();
            }}
          >
            {props.onSubmitText}
          </button>
         
          </div>
          </div>
      </div>
     
    </div>
  );
};