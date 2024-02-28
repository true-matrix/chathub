import React, { FC } from 'react';
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

    <div className='custom-ui  shadow-lg p-0 overflow-hidden'> 
      <div className='modal-header-colored'>
          <div className='modal-header d-block'> 
            <h1 className='text-white text-center m-0 fs-3'>{props?.heading}</h1>
          </div>
          <div className="confirmBody p-3">
          <p className='p-4'>{props?.subHeading}</p>
          <div className="confirmFooter btn-right">
          <button className="btn btn-link btn-block " onClick={props.onClose}>{props.onCloseText}</button>
          <button
            className="btn btn-primary btn-block "
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