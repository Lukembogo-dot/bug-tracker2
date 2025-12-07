import { ProjectRepository } from "../repositories/projects.repositories";
import { UserRepository } from "../repositories/user.repositories";
import { Project, CreateProject, UpdateProject } from "../Types/projects.types";

const validateAndParseProjectData = async (body: any): Promise<CreateProject> => {
    const { projectname, description, createdby, assignedto } = body ?? {};

    if (!projectname || !createdby) {
        throw new Error("Missing required fields: projectname and createdby are required");
    }

    if (typeof projectname !== 'string' || typeof createdby !== 'number') {
        throw new Error("Invalid field types: projectname must be string, createdby must be number");
    }

    const trimmedProjectName = projectname.trim();
    if (trimmedProjectName.length === 0) {
        throw new Error("ProjectName cannot be empty");
    }

    // Validate user exists
    const user = await UserRepository.getUserById(createdby);
    if (!user) {
        throw new Error("Invalid CreatedBy: User does not exist");
    }

    // Validate assignee exists if provided
    if (assignedto !== undefined) {
        const assignee = await UserRepository.getUserById(assignedto);
        if (!assignee) {
            throw new Error("Invalid assignedto: User does not exist");
        }
    }

    return {
        projectname: trimmedProjectName,
        description: description || undefined,
        createdby,
        assignedto: assignedto || undefined
    };
};

const validateAndParseUpdateProjectData = (body: any): UpdateProject => {
    const { projectname, description, assignedto } = body ?? {};

    if (projectname !== undefined && (typeof projectname !== 'string' || projectname.trim().length === 0)) {
        throw new Error("Invalid ProjectName: Must be non-empty string");
    }

    return {
        projectname: projectname ? projectname.trim() : undefined,
        description,
        assignedto
    };
};

// Get all projects
export const getAllProjects = async (): Promise<Project[]> => {
    try {
        const projects: Project[] = await ProjectRepository.getAllProjects();
        return projects;
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};

// Get project by ID
export const getProjectById = async (projectId: number): Promise<Project | null> => {
    try {
        if (isNaN(projectId)) {
            throw new Error('Invalid project ID');
        }

        const project: Project | null = await ProjectRepository.getProjectById(projectId);
        return project;
    } catch (error: any) {
        console.error('Error fetching project by ID:', error);
        throw error;
    }
};

// Get projects by assignee
export const getProjectsByAssignee = async (assigneeId: number): Promise<Project[]> => {
    try {
        if (isNaN(assigneeId)) {
            throw new Error('Invalid assignee ID');
        }

        const projects: Project[] = await ProjectRepository.getProjectsByAssignee(assigneeId);
        return projects;
    } catch (error: any) {
        console.error('Error fetching projects by assignee:', error);
        throw error;
    }
};

// Create new project
export const createProject = async (projectData: any): Promise<Project> => {
    console.log("Project received", projectData);
    if (!projectData) {
        throw new Error("Please provide project data");
    }

    try {
        const newProject = await validateAndParseProjectData(projectData);
        console.log("Project parsed", newProject);

        const createdProject = await ProjectRepository.createProject(newProject);
        return createdProject;
    } catch (error: any) {
        console.error('Error creating project:', error);
        throw error;
    }
};

// Update project
export const updateProject = async (projectId: number, projectData: any): Promise<Project | null> => {
    try {
        if (isNaN(projectId)) {
            throw new Error('Invalid project ID');
        }

        if (!projectData || Object.keys(projectData).length === 0) {
            throw new Error("No update data provided");
        }

        const updateData = validateAndParseUpdateProjectData(projectData);

        const updatedProject = await ProjectRepository.updateProject(projectId, updateData);
        return updatedProject;
    } catch (error: any) {
        console.error('Error updating project:', error);
        throw error;
    }
};

// Delete project
export const deleteProject = async (projectId: number): Promise<boolean> => {
    try {
        if (isNaN(projectId)) {
            throw new Error('Invalid project ID');
        }

        const deleted = await ProjectRepository.deleteProject(projectId);
        return deleted;
    } catch (error: any) {
        console.error('Error deleting project:', error);
        throw error;
    }
};

// Get project count by user
export const getProjectCountByUser = async (userId: number): Promise<number> => {
    try {
        if (isNaN(userId)) {
            throw new Error('Invalid user ID');
        }

        const count = await ProjectRepository.getProjectCountByUser(userId);
        return count;
    } catch (error: any) {
        console.error('Error fetching project count by user:', error);
        throw error;
    }
};