export interface User {
  id: string;
  username: string;
}

export interface Room {
  id: string;
  name?: string;
  users: User[];
}
