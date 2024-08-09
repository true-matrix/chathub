import {
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassPlusIcon,
  PaperClipIcon,
  PencilSquareIcon,
  XMarkIcon,
  TrashIcon, 
  ArrowUturnLeftIcon
} from "@heroicons/react/20/solid";
import { useRef, useState } from "react";
import {  ChatListItemInterface, ChatMessageInterface } from "../../interfaces/chat";
import { classNames } from "../../utils";
import { getRecentTime } from "../../commonhelper";
import DOC_PREVIEW from "../../assets/images/doc-preview.png";
import dropdown_icon from "../../assets/images/dropdown-dots.svg";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import CopyText from "../CopyText";
import { useGlobal } from "../../context/GlobalContext";
import ForwardMessageModal from "./ForwardMessageModal";
// import { useNavigate } from "react-router-dom";

const MessageItem: React.FC<{
  isOwnMessage?: boolean;
  isGroupChatMessage?: boolean;
  message: ChatMessageInterface;
  onMessageClick?: any;
  onMessageReply?: any;
  // onMessageDelete?: any;
  onMessageDelete?: any;
  scrollToPrevMessage?: any; // Add scrollToPrevMessage prop
  highlightedMessageId?: string; // Add highlightedMessageId prop
  messageRef?: any;
  onSeen?: any;
}> = ({ message, isOwnMessage, isGroupChatMessage, onMessageClick, onMessageReply, onMessageDelete, messageRef, highlightedMessageId, scrollToPrevMessage, onSeen }) => {
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  // const [creatingChat, setCreatingChat] = useState(false);
  // const [dataLoading, setDataLoading] = useState(false);
  // const currentChat = useRef<ChatListItemInterface | null>(null);
  // const { user } = useAuth();
  const { setIsMessageEditing, setIsMessageDeleting, setIsMessageReplying } = useGlobal();
  const currentChat = useRef<ChatListItemInterface | null>(null);
  
  // const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  // const messageRefs = useRef<any>([]);
  //  const [highlightedMessageId, setHighlightedMessageId] = useState("");
  // const messageRefs : any = useRef({});
  // const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [openForwardChat, setOpenForwardChat] = useState(false); // To control the 'Add Chat' modal
  // const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  const containsLink = (text : string) => {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
  };
  const openLinkInNewTab = (url : any) => {
  window.open(url, '_blank');
  };

  // Function to create a new chat with a user
  // const createNewChat = async (selectedUserId: string) => {
  //   let chatId: string;
  //   // Handle the request to create a chat
  //   await requestHandler(
  //         async () => await getChatId(selectedUserId, user._id),
  //         setDataLoading,
  //     (res) => {
  //       const { data } = res; // Extract data from response
  //       chatId = data.chatId;
  //         },
  //         alert // Display error alerts on request failure
  //       );
  //   await requestHandler(
  //     async () => await getChatMessages(chatId),
  //     setCreatingChat, // Callback to handle loading state
  //     (res) => {
  //       const { data } = res; // Extract data from response
  //       if (
  //             currentChat.current?._id &&
  //             currentChat.current?._id === data._id
  //           )
  //         return;
  //       LocalStorage.set("currentChat", data);
  //       LocalStorage.set("unreadMessages", []);
  //                     currentChat.current = data;
  //     },
  //     alert // Use the alert as the error handler
  //   );
  // };
  // console.log(dataLoading);
  // console.log(creatingChat);
  
  const handleEditMessage = (message: any) => {
    onMessageClick(message);
    setIsMessageEditing(true);
    setIsMessageReplying(false);
    setIsMessageDeleting(false);
  }

  const handleReplyMessage = (message: any) => {
    onMessageReply(message);
    setIsMessageReplying(true);
    setIsMessageEditing(false);
    setIsMessageDeleting(false);
  }

  // const handleDeleteMessage = (message: any) => {
  //   onMessageDelete(message);
  //   setIsMessageDeleting(true);
  //   setIsMessageReplying(false);
  //   setIsMessageEditing(false);


  // }

  const deleteChat = async (message: any) => {
    console.log('currentChat.current?._id',currentChat.current?._id);
    console.log('currentChat',currentChat);
    console.log('ddd mmm',message);
    
    onMessageDelete(message);
    setIsMessageDeleting(true);
    setIsMessageReplying(false);
    setIsMessageEditing(false);
    setIsModalOpen(false)
    
    // await requestHandler(
    //   //  A callback function that performs the deletion of a one-on-one chat by its ID.
    //   async () => await deleteMessage(message.id),
    //   null,
    //   // A callback function to be executed on success. It will call 'onChatDelete'
    //   // function with the chat's ID as its parameter.
    //   () => {
    //     onMessageDelete(message);
    //     setIsMessageDeleting(true);
    //     setIsMessageReplying(false);
    //     setIsMessageEditing(false);
    //   },
    //   // The 'alert' function (likely to display error messages to the user.
    //   alert
    // );
  };

//  const getClassName = (status : string) => {
//     switch (status) {
//       case 'sent':
//         return 'text-sm text-gray-500'; 
//       case 'messageReceived':
//         return 'text-sm text-gray-500'; 
//       case 'seenByOne':
//         return 'text-sm text-yellow-500'; 
//       case 'seenByAll':
//         return 'text-sm text-green-500'; 
//       default:
//         return 'text-sm text-gray-500'; 
//     }
//   };

//  const getSeenClassName = (status : any) => {
//     switch (status) {
//       case false:
//         return 'text-sm text-gray-500';
//       default:
//         return 'text-sm text-green-500';
//     }
  //   }; 
//   const getSeenClassName = (status: any) => {
//     switch (true) {
//       case status === 0:
//         return 'text-sm text-gray-500'; 
//       case status >= 1:
//         return 'text-sm text-green-500'; 
//       default:
//         return ''; // Handle other cases as needed
//     }
// };

  // Function to scroll to the previous message
  // const scrollToPrevMessage = (id : any) => {
  //   const keys = Object.keys(messageRefs.current);
  //   const index = 0;
  //   console.log('keys',keys);
  //   console.log('index', index);
  //   console.log('id',id);
  //   // keys.push(id)
    
  //   if (index > 0) {
  //     const prevMessageId : any = keys[index - 1];
  //     const prevMessageRef : any = messageRefs.current[prevMessageId];
  //     window.scrollTo({
  //       top: prevMessageRef.offsetTop,
  //       behavior: "smooth",
  //     });
  //     // Highlight the message for 3 seconds
  //     setHighlightedMessageId(prevMessageId);
  //     setTimeout(() => {
  //       setHighlightedMessageId("");
  //     }, 3000);
  //   }
  //   else if (index === 0) {
  //     // If already at the first message, scroll to the top of the page
  //     window.scrollTo({
  //       top: 0,
  //       behavior: "smooth",
  //     });
  //     // Highlight the message for 3 seconds
  //     setHighlightedMessageId(keys[0]);
  //     setTimeout(() => {
  //       setHighlightedMessageId("");
  //     }, 3000);
  //   }
  // };

  
 // Function to handle ref assignment for each message
  // const setMessageRef = (id : any, element : any) => {
  //   messageRefs.current[id] = element;
  // };

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           onSeen(message._id);
  //         }
  //       });
  //     },
  //     { threshold: 1.0 }
  //   );

  //   if (messageRef.current) {
  //     observer.observe(messageRef.current);
  //   }

  //   return () => {
  //     if (messageRef.current) {
  //       observer.unobserve(messageRef.current);
  //     }
  //   };
  // }, [message._id, onSeen]);

  const handleForwardMessage = (message: any) => {
    // onMessageReply(message);
    setOpenForwardChat(true)
    setIsMessageReplying(false);
    setIsMessageEditing(false);
    setIsMessageDeleting(false);
    console.log('message',message);
    // navigate("/settings")
    
  }


  // const getChats = async () => {
  //   requestHandler(
  //     async () => await getUserChats(),
  //     setLoadingChats,
  //     (res) => {
  //       const { data } = res;
  //       setChats(data || []);
  //       LocalStorage.set("userChats", data);
  //     },
  //     alert
  //   );
  // };

  return (
    <>
    <ForwardMessageModal
        open={openForwardChat}
        onClose={() => {
          setOpenForwardChat(false);
        }}
        onSuccess={() => {
          [{'name': 'rajesh gole'}]
        }}
      />
      {resizedImage ? (
        <div className="h-full z-40 p-8 overflow-hidden w-full absolute inset-0 bg-black/70 flex justify-center items-center">
          <XMarkIcon
            className="absolute top-5 right-5 w-9 h-9 text-white cursor-pointer"
            onClick={() => setResizedImage(null)}
          />
          <img
            className="max-w-11/12 object-contain"
            src={resizedImage}
            alt="chat image"
          />
        </div>
      ) : null}

      {/* <div className="message-wraper active bg-success-light p-4 rounded-lg"> */}
      <div key={message?.parentMessage} ref={() =>messageRef(message?.parentMessage)} className={classNames(
        "message-wraper py-3",
        (message.parentMessage === highlightedMessageId) ? "active bg-success-light p-4 rounded-lg" : ""
      )}>
        <div
          className={classNames(
            "flex relative justify-start items-end gap-3 max-w-lg min-w- w-fit",
            isOwnMessage ? "ml-auto" : ""
          )}
        > 
            <div className={ classNames("shrink-0", 
                isOwnMessage ? "order-2" : "order-1"
              )}>
              <div className="flex justify-center">
              {isOwnMessage && (
                <>
                {/* {message.status ? message.status : '-'} */}
                {/* {JSON.stringify(onSeen)} */}

                 
                 {!onSeen ? (
                    <span className="text-white-500">
                     
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="bg-success-light rounded-full mb-1">
                    <path d="M14.4665 7.28435C14.6602 7.09995 14.9179 6.99801 15.1853 7.00003C15.4528 7.00205 15.709 7.10789 15.8998 7.2952C16.0907 7.48251 16.2014 7.73665 16.2084 8.00399C16.2155 8.27133 16.1184 8.53097 15.9377 8.7281L10.4515 15.5894C10.3571 15.691 10.2433 15.7725 10.1167 15.8291C9.99013 15.8857 9.85345 15.9162 9.71482 15.9188C9.57619 15.9213 9.43847 15.8959 9.30989 15.844C9.18131 15.7922 9.06451 15.7149 8.96647 15.6169L5.32822 11.9786C5.2269 11.8842 5.14564 11.7703 5.08927 11.6438C5.03291 11.5173 5.0026 11.3808 5.00016 11.2423C4.99772 11.1039 5.02319 10.9663 5.07506 10.8379C5.12692 10.7095 5.20412 10.5929 5.30205 10.4949C5.39997 10.397 5.51662 10.3198 5.64503 10.2679C5.77344 10.2161 5.91098 10.1906 6.04944 10.193C6.18791 10.1955 6.32446 10.2258 6.45096 10.2822C6.57746 10.3385 6.69131 10.4198 6.78572 10.5211L9.66497 13.399L14.439 7.3146L14.4665 7.28435Z" fill="#42AB65"/>
                    </svg>


                    </span>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="bg-success-light rounded-full mb-1">
                    <path d="M12.3337 6.83405C12.5274 6.64965 12.7851 6.54771 13.0525 6.54973C13.32 6.55175 13.5761 6.65759 13.767 6.8449C13.9579 7.03221 14.0686 7.28635 14.0756 7.55369C14.0827 7.82103 13.9856 8.08067 13.8049 8.2778L8.31866 15.1391C8.22432 15.2407 8.11047 15.3222 7.98389 15.3788C7.85732 15.4354 7.72063 15.4659 7.58201 15.4685C7.44338 15.471 7.30566 15.4456 7.17708 15.3937C7.0485 15.3419 6.9317 15.2646 6.83366 15.1666L3.19541 11.5283C3.09409 11.4339 3.01283 11.32 2.95646 11.1935C2.9001 11.067 2.86979 10.9305 2.86735 10.792C2.8649 10.6536 2.89038 10.516 2.94224 10.3876C2.99411 10.2592 3.07131 10.1426 3.16923 10.0446C3.26716 9.9467 3.38381 9.8695 3.51221 9.81763C3.64062 9.76577 3.77816 9.7403 3.91663 9.74274C4.0551 9.74518 4.19165 9.77549 4.31815 9.83185C4.44465 9.88822 4.5585 9.96948 4.65291 10.0708L7.53216 12.9487L12.3062 6.8643L12.3337 6.83405ZM11.0687 13.9016L12.3337 15.1666C12.4317 15.2644 12.5484 15.3415 12.6768 15.3932C12.8053 15.445 12.9429 15.4703 13.0813 15.4678C13.2198 15.4652 13.3563 15.4348 13.4827 15.3783C13.6092 15.3218 13.723 15.2405 13.8173 15.1391L19.3063 8.2778C19.4049 8.18046 19.4829 8.06423 19.5356 7.93608C19.5882 7.80793 19.6146 7.67047 19.6129 7.53192C19.6113 7.39337 19.5818 7.25656 19.5261 7.12968C19.4705 7.00279 19.3898 6.88842 19.289 6.79339C19.1881 6.69837 19.0692 6.62465 18.9392 6.57662C18.8092 6.52859 18.6709 6.50725 18.5325 6.51387C18.3941 6.52049 18.2585 6.55493 18.1337 6.61514C18.0089 6.67535 17.8975 6.76009 17.8062 6.8643L13.0308 12.9487L12.3639 12.2804L11.0687 13.9016Z" fill="#42AB65"/>
                    </svg> 

                  )}
                </>
              )}
              </div>

              {isGroupChatMessage && <img
                src={message.sender?.avatar?.url}
                className={classNames(
                  "h-8 w-8 object-cover rounded-full flex flex-shrink-0",
                  isOwnMessage ? "order-2 hidden" : "order-1"
              )} />}
          </div>
           
          
         
          <div className={classNames(
              "dropdown-icon",
              isOwnMessage
                ? "dropdown-icon-left"
                : "dropdown-icon-right"
          )}>
            <Popup trigger={<button><img src={dropdown_icon} />
              </button>} position={isOwnMessage ? "left center" : "right center"}>
                <div className="flex flex-col gap-2">
                  {message.content && <div className="flex items-center">
                  <CopyText textToCopy={message.content}  className="flex items-center"/>
                </div>}
                <div className="flex items-center" onClick={() => handleReplyMessage({ 'content': message.content, 'id': message._id, 'data': message })}>
                    <ArrowUturnLeftIcon className="w-5 h-5 mr-2 text-green-600" />
                  <span>Reply</span>
                </div>
                <div className="flex items-center" onClick={() => handleForwardMessage({ 'content': message.content, 'id': message._id, 'data': message })}>
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2 text-blue-600" />
                  <span>Forward</span>
                </div>
                {(message.content && isOwnMessage) && <div className="flex items-center" onClick={() => handleEditMessage({ 'content': message.content, 'id': message._id })}>
                  <PencilSquareIcon className="w-5 h-5 mr-2 text-yellow-600" />
                  <span>Edit</span>
                </div>}
                {/* {(message.content && isOwnMessage) && <div className="flex items-center" onClick={() => handleDeleteMessage({ 'id': message._id })}> */}
                {(message.content && isOwnMessage) && <div className="flex items-center" onClick={openModal}>
                        <TrashIcon className="w-5 h-5 mr-2 text-red-600" />
                        <span>Delete</span>
                  </div>}
                {(message.content && isOwnMessage && isModalOpen ) && 
                
                // <div className="flex items-center" onClick={(e) => {
                //     e.stopPropagation();
                //     const ok = confirm(
                //       "Are you sure you want to delete this chat?"
                //     );
                //     if (ok) {
                //       deleteChat({ '_id': message._id,'chat': message.chat });
                //     }
                //   }}>
                //   <TrashIcon className="w-5 h-5 mr-2" />
                //   <span>Delete</span>
                // </div>
                  
                (
                  <div 
                    id="popup-modal" 
                    className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
                  >
                    <div className="relative p-8 w-full max-w-md max-h-full">
                      <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <button 
                          type="button" 
                          onClick={closeModal} 
                          className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" 
                          data-modal-hide="popup-modal"
                        >
                          <svg 
                            className="w-3 h-3" 
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 14 14"
                          >
                            <path 
                              stroke="currentColor" 
                              stroke-linecap="round" 
                              stroke-linejoin="round" 
                              stroke-width="2" 
                              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                          </svg>
                          <span className="sr-only">Cancel</span>
                        </button>
                        <div className="p-4 md:p-5 text-center">
                          <svg 
                            className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" 
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 20 20"
                          >
                            <path 
                              stroke="currentColor" 
                              stroke-linecap="round" 
                              stroke-linejoin="round" 
                              stroke-width="2" 
                              d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Delete this message?
                          </h3>
                          <button 
                            onClick={closeModal} 
                            type="button" 
                            className="py-2.5 px-5 ms-3 mr-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => deleteChat({ '_id': message._id,'chat': message.chat })} 
                            type="button" 
                            className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                          >
                            Delete
                          </button>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                )          
                
                } 
                {/* <div className="flex items-center">
                  <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
                  <span>Reply</span>
                </div>  */}
              </div>
            </Popup>
              {/* <img src={dropdown_icon} /> */}
          </div>

          <div
            className={classNames(
              "p-4 rounded-3xl flex flex-col break-all",
              isOwnMessage
                ? "order-1 rounded-br-none bg-primary"
                : "order-2 rounded-bl-none bg-white"
            )}
          >
            {isGroupChatMessage && !isOwnMessage ? (
              <p
                className={classNames(
                  "text-xs font-semibold mb-2",
                  ["text-success", "text-danger"][
                    message.sender.name.length % 2
                  ]
                )}
                // onClick={() => createNewChat(message.sender?._id)}
                style={{ cursor: "pointer" }}
              >
                {message.sender?.name}
              </p>
            ) : null}

            {(message.updatedParentMessage && message.updatedParentMessage !==null) && (<div className="reply-message-block bg-gray-100 p-2 mb-2  rounded-xl" onClick={() => scrollToPrevMessage(message?.parentMessage)}>
              <p className="text-xs text-green-500 ">{message.updatedParentMessage?.senderName ? message.updatedParentMessage?.senderName : ''}</p>
              <p className="truncate-1 text-sm text-zinc-500  hover:underline underline-offset-1">{message.updatedParentMessage?.content ? message.updatedParentMessage?.content : (message.updatedParentMessage.attachments.length > 0 ? <img
                        className="h-8 w-8 object-contain"
                        src={message.updatedParentMessage.attachments[0].url}
                        alt="msg_img"
                      /> : 'File')}</p>
            </div>)}        

            {message?.attachments?.length > 0 ? (
              <div
                className={classNames(
                  "grid max-w-7xl gap-2",
                  message.attachments?.length === 1 ? " grid-cols-1" : "",
                  message.attachments?.length === 2 ? " grid-cols-2" : "",
                  message.attachments?.length >= 3 ? " grid-cols-3" : "",
                  message.content ? "mb-6" : ""
                )}
              >
                {message.attachments?.map((file) => {
                  return (
                    <div
                      key={file._id}
                      className="group relative  rounded-xl overflow-hidden cursor-pointer"
                    >
                      <button
                        onClick={() => setResizedImage(file.url)}
                        className="absolute inset-0 z-20 flex justify-center items-center w-full gap-2 h-full bg-black/60 group-hover:opacity-100 opacity-0 transition-opacity ease-in-out duration-150"
                      >
                        <MagnifyingGlassPlusIcon className="h-6 w-6 text-white" />
                        <a
                          href={file.url}
                          download
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowDownTrayIcon
                            title="download"
                            className="hover:text-zinc-400 h-6 w-6 text-white cursor-pointer"
                          />
                        </a>
                      </button>
                      <img
                        className="h-full w-full object-contain chat-image"
                        src={file.url.toLowerCase().endsWith('.pdf') ? DOC_PREVIEW : file.url}
                        alt="msg_img"
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* {message.content ? (
              <p className={classNames("text-sm",isOwnMessage ? "text-zinc-50" : "text-zinc-800")} >{message.content}</p>
            ) : null} */}
            {
              message.content ? (
                <p className={`text-sm ${isOwnMessage ? 'text-zinc-50' : 'text-zinc-800'}  hover:underline underline-offset-1`}>
                  {containsLink(message.content) ? (
                    message.content.split(/(https?:\/\/[^\s]+)/g).map((part, index) => (
                      containsLink(part) ? (
                        <a
                          key={index}
                          href={part}
                          target="_blank"
                          className="shared-link"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            openLinkInNewTab(part);
                          }} 
                        >
                          {part}
                        </a>
                      ) : (
                        <span key={index}>{part}</span>
                      )
                    ))
                  ) : (
                    message.content
                  )}
                </p>
              ) : null }
            <p
              className={classNames(
                "mt-1.5 self-end text-[10px] inline-flex items-center",
                isOwnMessage ? "text-zinc-200" : "text-zinc-400"
              )}
            >
              {message.attachments?.length > 0 ? (
                <PaperClipIcon className="h-4 w-4 mr-2 " />
              ) : null}
              {/* {moment(message.updatedAt).add("TIME_ZONE, "hours").fromNow(true)}{" "} */}
              {/* {moment(message.updatedAt).subtract("TIME_ZONE", "hours").fromNow(true)}{" "}
              ago */}
              {message?.edited ? <span style={{ fontStyle: 'italic' }}>{`edited`} &nbsp;</span> : ''}
              {getRecentTime(message.createdAt)}
              {/* {getRecentTime(message.updatedAt)} */}
              {/* Tick indicators based on message status */}
            {isOwnMessage && (
              <>
                {!message.seen ? (
                  <span className="text-white-500">&#10003;</span>
                ) : (
                  <span className="text-green-500">&#10003;&#10003;</span>
                )}
              </>
            )}
            </p>
            {/* {(isOwnMessage) && <p className={getSeenClassName(message?.seen)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </p>} */}
            
            {/* {(isOwnMessage) && <p className={getSeenClassName(message?.seenBy?.length)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </p>} */}

            {/* {(isOwnMessage && message?.status === 'sent') && <p className={getClassName(message?.status)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </p>}

            {(isOwnMessage && (message?.status === 'seenByOne' || message?.status === 'seenByAll' || message?.status === 'messageReceived')) && <p className={getClassName(message?.status)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          </p>} */}
          </div>
        </div>
      </div>







      <div className="message-wraper ">
        <div
          className={classNames(
            "flex relative justify-start items-end gap-3 max-w-lg min-w- w-fit",
            isOwnMessage ? "ml-auto" : ""
          )}
        >
        
        </div>
      </div>
    </>
  );
};

export default MessageItem;
