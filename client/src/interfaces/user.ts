export interface UserInterface {
  _id: string;
  avatar: {
    url: string;
    localPath: string;
    _id: string;
  };
  username: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
