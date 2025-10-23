import { ProjectRepository } from "../repositories/projects.repositories";
import { UserRepository } from "../repositories/user.repositories";
import { Project, CreateProject, UpdateProject } from "../Types/projects.types";
import { Response } from 'express';
import { Request } from 'express';

const validateAndParseProjectData = async (body: any): Promise<CreateProject> => {
    const { ProjectName, Description, CreatedBy } = body ?? {};

    if (!ProjectName || !CreatedBy) {
        throw new Error("Missing required fields: ProjectName and CreatedBy are required");
    }

    if (typeof ProjectName !== 'string' || typeof CreatedBy !== 'number') {
        throw new Error("Invalid field types: ProjectName must be string, CreatedBy must be number");
    }

    const projectName = ProjectName.trim();
    if (projectName.length === 0) {
        throw new Error("ProjectName cannot be empty");
    }

    // Validate user exists
    const user = await UserRepository.getUserById(CreatedBy);
    if (!user) {
        throw new Error("Invalid CreatedBy: User does not exist");
    }

    return {
        ProjectName: projectName,
        Description: Description || undefined,
        CreatedBy
    };
};

const validateAndParseUpdateProjectData = (body: any): UpdateProject => {
    const { ProjectName, Description } = body ?? {};

    if (ProjectName !== undefined && (typeof ProjectName !== 'string' || ProjectName.trim().length === 0)) {
        throw new Error("Invalid ProjectName: Must be non-empty string");
    }

    return {
        ProjectName: ProjectName ? ProjectName.trim() : undefined,
        Description
    };
};

// Get all projects
export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const projects: Project[] = await ProjectRepository.getAllProjects();
        return res.status(200).json(projects);
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get project by ID
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        const project: Project | null = await ProjectRepository.getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        return res.status(200).json(project);
    } catch (error: any) {
        console.error('Error fetching project by ID:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get projects by creator
export const getProjectsByCreator = async (req: Request, res: Response) => {
    try {
        const creatorId = parseInt(req.params.creatorId, 10);
        if (isNaN(creatorId)) {
            return res.status(400).json({ message: 'Invalid creator ID' });
        }

        const projects: Project[] = await ProjectRepository.getProjectsByCreator(creatorId);
        return res.status(200).json(projects);
    } catch (error: any) {
        console.error('Error fetching projects by creator:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Create new project
export const createProject = async (req: Request, res: Response) => {
    console.log("Project received", req.body);
    if (!req.body) {
        console.log("Project creation requires body");
        return res.status(400).json({ message: "Please provide project data" });
    }

    try {
        const newProject = await validateAndParseProjectData(req.body);
        console.log("Project parsed", newProject);

        const createdProject = await ProjectRepository.createProject(newProject);

        res.status(201).json({
            message: "Project created successfully",
            project: createdProject
        });
    } catch (error: any) {
        console.error('Error creating project:', error);
        if (error.message.includes('Missing required fields') ||
            error.message.includes('Invalid field types') ||
            error.message.includes('Invalid') ||
            error.message.includes('cannot be empty')) {
            return res.status(400).json({
                message: "Validation failed",
                error: error.message
            });
        }
        res.status(500).json({
            message: "Failed to create project",
            error: error.message
        });
    }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
    try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No update data provided" });
        }

        const updateData = validateAndParseUpdateProjectData(req.body);

        const updatedProject = await ProjectRepository.updateProject(projectId, updateData);
        if (!updatedProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json({
            message: "Project updated successfully",
            project: updatedProject
        });
    } catch (error: any) {
        console.error('Error updating project:', error);
        if (error.message.includes('Invalid') ||
            error.message.includes('No fields to update')) {
            return res.status(400).json({
                message: "Validation failed",
                error: error.message
            });
        }
        res.status(500).json({
            message: "Failed to update project",
            error: error.message
        });
    }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        const deleted = await ProjectRepository.deleteProject(projectId);
        if (!deleted) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json({ message: "Project deleted successfully" });
    } catch (error: any) {
        console.error('Error deleting project:', error);
        res.status(500).json({
            message: "Failed to delete project",
            error: error.message
        });
    }
};