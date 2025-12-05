export interface Bug {
 bugid: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectid: number;
  reportedby: number | null;
  assignedto: number | null;
  createdat: Date;
}

export interface CreateBug {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  projectid: number;
  reportedby?: number;
  assignedto?: number;
}

export interface UpdateBug {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedto?: number;
}