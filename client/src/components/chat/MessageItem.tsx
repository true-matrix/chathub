import {
  ArrowDownTrayIcon,
  MagnifyingGlassPlusIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useState } from "react";
import { ChatMessageInterface } from "../../interfaces/chat";
import { classNames } from "../../utils";
import { getRecentTime } from "../../commonhelper";
import DOC_PREVIEW from "../../assets/images/doc-preview.png";

const MessageItem: React.FC<{
  isOwnMessage?: boolean;
  isGroupChatMessage?: boolean;
  message: ChatMessageInterface;
}> = ({ message, isOwnMessage, isGroupChatMessage }) => {
  const [resizedImage, setResizedImage] = useState<string | null>(null);

  const containsLink = (text : string) => {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
  };
  const openLinkInNewTab = (url : any) => {
  window.open(url, '_blank');
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
            className="w-full h-full object-contain"
            src={resizedImage}
            alt="chat image"
          />
        </div>
      ) : null}
      <div
        className={classNames(
          "flex justify-start items-end gap-3 max-w-lg min-w-",
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
        <div
          className={classNames(
            "p-4 rounded-3xl flex flex-col",
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
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
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
                      className="h-full w-full object-cover"
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
              <p className={`text-sm ${isOwnMessage ? 'text-zinc-50' : 'text-zinc-800'}`}>
                {containsLink(message.content) ? (
                  message.content.split(/(https?:\/\/[^\s]+)/g).map((part, index) => (
                    containsLink(part) ? (
                      <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          openLinkInNewTab(part);
                        }}
                        style={{ color: '#0900ff' }}
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
            {getRecentTime(message.updatedAt)}
          </p>
        </div>
      </div>
    </>
  );
};

export default MessageItem;
