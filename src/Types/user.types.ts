export interface User {
  UserID: number;
  Username: string;
  Email: string;
  passwordhash: string;
  Role: string;
  CreatedAt: Date;
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
<<<<<<< HEAD

=======
>>>>>>> c5b7d3fc7ee581d98dbfcc95b9edc5db87545995
