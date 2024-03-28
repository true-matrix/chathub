import {
  ArrowDownTrayIcon,
  MagnifyingGlassPlusIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import { ChatListItemInterface, ChatMessageInterface } from "../../interfaces/chat";
import { LocalStorage, classNames, requestHandler } from "../../utils";
import { getRecentTime } from "../../commonhelper";
import DOC_PREVIEW from "../../assets/images/doc-preview.png";
import dropdown_icon from "../../assets/images/dropdown-dots.svg";
import { createUserChat, editMessage, getChatId, getChatMessages } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import {PencilIcon, TrashIcon, ArrowUturnLeftIcon } from '@heroicons/react/20/solid';
import CopyText from "../CopyText";
import { useGlobal } from "../../context/GlobalContext";

const MessageItem: React.FC<{
  isOwnMessage?: boolean;
  isGroupChatMessage?: boolean;
  message: ChatMessageInterface;
  onMessageClick?: any;
  onMessageDelete?: any;
}> = ({ message, isOwnMessage, isGroupChatMessage, onMessageClick, onMessageDelete }) => {
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const currentChat = useRef<ChatListItemInterface | null>(null);
  const { user } = useAuth();
  const { setIsMessageEditing, setIsMessageDeleting } = useGlobal();
  const messageItemRef = useRef<HTMLDivElement>(null);


  const containsLink = (text : string) => {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
  };
  const openLinkInNewTab = (url : any) => {
  window.open(url, '_blank');
  };

  // Function to create a new chat with a user
  const createNewChat = async (selectedUserId: string) => {
    let chatId: string;
    // Handle the request to create a chat
    await requestHandler(
          async () => await getChatId(selectedUserId, user._id),
          setDataLoading,
      (res) => {
        const { data } = res; // Extract data from response
        chatId = data.chatId;
          },
          alert // Display error alerts on request failure
        );
    await requestHandler(
      async () => await getChatMessages(chatId),
      setCreatingChat, // Callback to handle loading state
      (res) => {
        const { data } = res; // Extract data from response
        if (
              currentChat.current?._id &&
              currentChat.current?._id === data._id
            )
          return;
        LocalStorage.set("currentChat", data);
        LocalStorage.set("unreadMessages", []);
                      currentChat.current = data;
      },
      alert // Use the alert as the error handler
    );
  };
  const handleEditMessage = (message: any) => {
    onMessageClick(message);
    setIsMessageEditing(true);
    setIsMessageDeleting(false);
  }

  const handleDeleteMessage = (message: any) => {
    onMessageDelete(message);
    setIsMessageDeleting(true);
  }

 const getClassName = (status : string) => {
    switch (status) {
      case 'sent':
        return 'text-sm text-gray-500'; 
      case 'messageReceived':
        return 'text-sm text-gray-500'; 
      case 'seenByOne':
        return 'text-sm text-yellow-500'; 
      case 'seenByAll':
        return 'text-sm text-green-500'; 
      default:
        return 'text-sm text-gray-500'; 
    }
  };

//  const getSeenClassName = (status : any) => {
//     switch (status) {
//       case false:
//         return 'text-sm text-gray-500';
//       default:
//         return 'text-sm text-green-500';
//     }
  //   }; 
  const getSeenClassName = (status: any) => {
    switch (true) {
      case status === 0:
        return 'text-sm text-gray-500'; 
      case status >= 1:
        return 'text-sm text-green-500'; 
      default:
        return ''; // Handle other cases as needed
    }
};
  return (
    <>
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

      <div className="message-wraper">
        <div
          className={classNames(
            "flex relative justify-start items-end gap-3 max-w-lg min-w- w-fit",
            isOwnMessage ? "ml-auto" : ""
          )}
        >
          <img
            src={message.sender?.avatar?.url}
            className={classNames(
              "h-8 w-8 object-cover rounded-full flex flex-shrink-0",
              isOwnMessage ? "order-2" : "order-1"
            )}
          />
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
                {(message.content && isOwnMessage) && <div className="flex items-center" onClick={() => handleEditMessage({ 'content': message.content, 'id': message._id })}>
                  <PencilIcon className="w-5 h-5 mr-2" />
                  <span>Edit</span>
                </div>}
                {(message.content && isOwnMessage) && <div className="flex items-center" onClick={() => handleDeleteMessage({ 'id': message._id })}>
                  <TrashIcon className="w-5 h-5 mr-2" />
                  <span>Delete</span>
                </div>} 
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
                        className="h-full w-full object-contain"
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
              {message?.edited ? 'edited ' : ''}
              {getRecentTime(message.createdAt)}
              {/* {getRecentTime(message.updatedAt)} */}
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
    </>
  );
};

export default MessageItem;
