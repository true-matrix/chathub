import { UserInterface } from "./user";

export interface ChatListItemInterface {
  admin: string;
  createdAt: string;
  isGroupChat: true;
  lastMessage?: ChatMessageInterface;
  name: string;
  participants: UserInterface[];
  updatedAt: string;
  _id: string;
  blocked?: boolean;
}

export interface ChatMessageInterface {
  _id: string;
  sender: Pick<UserInterface, "_id" | "avatar" | "email" | "username" | "name">;
  content: string;
  chat: string;
  attachments: {
    url: string;
    localPath: string;
    _id: string;
  }[];
  edited?: any;
  status: any;
  seen?: any;
  seenBy?: any;
  parentMessage?: string;
  updatedParentMessage?: any;
  createdAt: string;
  updatedAt: string;
}
