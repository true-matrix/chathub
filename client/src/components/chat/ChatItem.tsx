import {
  EllipsisVerticalIcon,
  PaperClipIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { deleteOneOnOneChat } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { ChatListItemInterface } from "../../interfaces/chat";
import { LocalStorage, classNames, getChatObjectMetadata, requestHandler } from "../../utils";
import GroupChatDetailsModal from "./GroupChatDetailsModal";
import { getRecentTime } from "../../commonhelper";

const ChatItem: React.FC<{
  chat: ChatListItemInterface;
  onClick: (chat: ChatListItemInterface) => void;
  isActive?: boolean;
  unreadCount?: number;
  onChatDelete: (chatId: string) => void;
  isOnline?: any;
}> = ({ chat, onClick, isActive, unreadCount = 0, onChatDelete, isOnline }) => {
  const { user } = useAuth();
  // const { openGroupInfo, setOpenGroupInfo } = useGlobal();
  const [openOptions, setOpenOptions] = useState(false);
  const [openGroupInfo, setOpenGroupInfo] = useState(false);
//  const getUserChatsOnlineStatus = () => {
//     const userChats = LocalStorage.get('userChats');
//     const res = userChats.map((group : any) => {
//       // if (!group.isGroupChat) {
//           if(chat._id === group._id){
//             group.participants.forEach((participant : any) => {
//               if (participant._id !== user._id) {
//                   return participant.islogin == true ? true : false;
//                 }
//             });
//           }
//         // }
//     });
//    console.log('res',res);
//    return res;
  //   }
//   const getUserChatsOnlineStatus = () => {
//     const userChats = LocalStorage.get('userChats');
//     const res = userChats.map((group : any) => {
//         if (chat._id === group._id) {
//             return group.participants.some((participant : any) => {
//                 return participant._id !== user._id && participant.islogin;
//             });
//         }
//     })
//     return res.some((value:any) => value !== null && value !== undefined);
// }
  useEffect(() => {
    const userChats = LocalStorage.get('userChats');
    const isChatOnline = userChats.find((group:any) => group._id === chat._id)?.participants.some((participant:any) => participant._id !== user._id && participant.islogin) || false;
    console.log('isChatOnline',isChatOnline)
  },[])
  
  // Define an asynchronous function named 'deleteChat'.
  const deleteChat = async () => {
    await requestHandler(
      //  A callback function that performs the deletion of a one-on-one chat by its ID.
      async () => await deleteOneOnOneChat(chat._id),
      null,
      // A callback function to be executed on success. It will call 'onChatDelete'
      // function with the chat's ID as its parameter.
      () => {
        onChatDelete(chat._id);
      },
      // The 'alert' function (likely to display error messages to the user.
      alert
    );
  };

  if (!chat) return;

  return (
    <>
      <GroupChatDetailsModal
        open={openGroupInfo}
        onClose={() => {
          setOpenGroupInfo(false);
        }}
        chatId={chat._id}
        onGroupDelete={onChatDelete}
      />
      <div
        role="button"
        onClick={() => onClick(chat)}
        onMouseLeave={() => setOpenOptions(false)}
        className={classNames(
          " px-4 bg-light-gray",
          isActive ? "border-[1px] border-success active bg-success-light" : "",
          unreadCount > 0
            ? "font-bold"
            : ""
        )}
      >
        <div className="py-2 group flex justify-between gap-3 items-start cursor-pointer border-b-[0.1px] "> 
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenOptions(!openOptions);
            }}
            className="self-center  relative"
          >
            <EllipsisVerticalIcon className="h-6 group-hover:w-6 group-hover:opacity-100 w-0 opacity-0 transition-all ease-in-out duration-100 text-zinc-300" />
            <div
              className={classNames(
                "z-20 text-left absolute bottom-0 translate-y-full text-sm w-52 bg-white rounded-2xl p-2 shadow-md ",
                openOptions ? "block" : "hidden"
              )}
            >
              {chat.isGroupChat ? (
                <p
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenGroupInfo(true);
                  }}
                  role="button"
                  className="p-4 w-full rounded-lg inline-flex items-center hover:bg-secondary hover:text-white"
                >
                  <InformationCircleIcon className="h-4 w-4 mr-2" /> About pack
                </p>
              ) : (
                <p
                  onClick={(e) => {
                    e.stopPropagation();
                    const ok = confirm(
                      "Are you sure you want to delete this chat?"
                    );
                    if (ok) {
                      deleteChat();
                    }
                  }}
                  role="button"
                  className="p-4 text-danger rounded-lg w-full inline-flex items-center hover:bg-danger hover:text-white"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete chat
                </p>
              )}
            </div>
          </button>
          <div className="flex justify-center items-center flex-shrink-0 position-relative">
            {chat.isGroupChat ? (
              <> 
            <img
                src={getChatObjectMetadata(chat, user!).avatar}
                className="w-12 h-12 rounded-full object-cover"
              /> 
              <span className="user-active"></span>
              </>
            ) : (<>
              <img
                  src={getChatObjectMetadata(chat, user!).avatar} 
                  className={`w-12 h-12 rounded-full object-cover border-4 ${isOnline ? 'border-green-500' : 'border-red-500'}`}
                />
            </>)}
          </div>
          <div className="w-full">
            <p className="truncate-1 text-sm">
              {getChatObjectMetadata(chat, user!).title}
            </p>
            <div className="w-full inline-flex items-center text-left">
              {chat.lastMessage && chat.lastMessage.attachments.length > 0 ? (
                // If last message is an attachment show paperclip
                <PaperClipIcon className="text-white/50 h-3 w-3 mr-2 flex flex-shrink-0" />
              ) : null}
              <small className="text-zinc-500 truncate-1  text-ellipsis inline-flex items-center">
                {getChatObjectMetadata(chat, user!).lastMessage}
              </small>
            </div>
          </div>
          <div className="flex text-white/50 h-full text-sm flex-col justify-between items-end">
            <small className="mb-2 inline-flex flex-shrink-0 w-max text-zinc-400">
              {/* {moment(chat.updatedAt).add("TIME_ZONE", "hours").fromNow(true)} */}
              {/* {moment(chat.updatedAt).subtract("TIME_ZONE", "hours").fromNow(true)} */}
              {getRecentTime(chat.updatedAt)}
              {/* {getRecentTime(chat.updatedAt)} */}
            </small>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.75 8.75V5.625C13.75 4.63044 13.3549 3.67661 12.6516 2.97335C11.9484 2.27009 10.9946 1.875 10 1.875C9.00544 1.875 8.05161 2.27009 7.34835 2.97335C6.64509 3.67661 6.25 4.63044 6.25 5.625V8.75M5.625 18.125H14.375C14.8723 18.125 15.3492 17.9275 15.7008 17.5758C16.0525 17.2242 16.25 16.7473 16.25 16.25V10.625C16.25 10.1277 16.0525 9.65081 15.7008 9.29917C15.3492 8.94754 14.8723 8.75 14.375 8.75H5.625C5.12772 8.75 4.65081 8.94754 4.29917 9.29917C3.94754 9.65081 3.75 10.1277 3.75 10.625V16.25C3.75 16.7473 3.94754 17.2242 4.29917 17.5758C4.65081 17.9275 5.12772 18.125 5.625 18.125Z" stroke="#71717ab0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>



            {/* Unread count will be > 0 when user is on another chat and there is new message in a chat which is not currently active on user's screen */}
            {unreadCount <= 0 ? null : (
              <span className="bg-success h-2 w-2 aspect-square flex-shrink-0 p-2 text-white text-xs rounded-full inline-flex justify-center items-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatItem;
