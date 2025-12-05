export interface Project {
  projectid: number;
  projectname: string;
  description: string | null;
  createdby: number;
  assignedto: number | null;
  createdat: Date;
}

export interface CreateProject {
  projectname: string;
  description?: string;
  createdby: number;
  assignedto?: number;
}

export interface UpdateProject {
  projectname?: string;
  description?: string;
  assignedto?: number;
}