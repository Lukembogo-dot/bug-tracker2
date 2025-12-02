export interface User {
  userid: number;
  username: string;
  email: string;
  passwordhash: string;
  role: string;
  createdat: Date;
}

export interface CreateUser {
  Username: string;
  Email: string;
  PasswordHash: string;
  Role?: string;
}

export interface UpdateUser {
  Username?: string;
  Email?: string;
  PasswordHash?: string;
  Role?: string;
}
