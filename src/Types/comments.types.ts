export interface Comment {
  commentid: number;
  bugid: number;
  userid: number;
  commenttext: string;
  createdat: Date;
  username?: string;
}


export interface CreateComment {
  bugid: number;
  userid: number;
  commenttext: string;
}

export interface UpdateComment {
  commenttext?: string;
}