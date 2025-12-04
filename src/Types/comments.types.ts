export interface Comment {
  CommentID: number;
  BugID: number;
  UserID: number;
  CommentText: string;
  CreatedAt: Date;
  Username?: string;
}


export interface CreateComment {
  BugID: number;
  UserID: number;
  CommentText: string;
}

export interface UpdateComment {
  CommentText?: string;
}