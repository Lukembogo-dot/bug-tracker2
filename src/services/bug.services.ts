import { BugRepository } from "../repositories/bugs.repositories";
import { ProjectRepository } from "../repositories/projects.repositories";
import { Bug, CreateBug, UpdateBug } from "../Types/bugs.types";
import { Response } from 'express';
import { Request } from 'express';

const validateAndParseBugData = async (body: any): Promise<CreateBug> => {
    const { Title, Description, Status, Priority, ProjectID, ReportedBy, AssignedTo } = body ?? {};

    if (!Title || !ProjectID) {
        throw new Error("Missing required fields: Title and ProjectID are required");
    }

    if (typeof Title !== 'string' || typeof ProjectID !== 'number') {
        throw new Error("Invalid field types: Title must be string, ProjectID must be number");
    }

    const title = Title.trim();
    if (title.length === 0) {
        throw new Error("Title cannot be empty");
    }

    // Validate project exists
    const project = await ProjectRepository.getProjectById(ProjectID);
    if (!project) {
        throw new Error("Invalid ProjectID: Project does not exist");
    }

    // Validate status if provided
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (Status && !validStatuses.includes(Status)) {
        throw new Error(`Invalid Status: Must be one of ${validStatuses.join(', ')}`);
    }

    // Validate priority if provided
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (Priority && !validPriorities.includes(Priority)) {
        throw new Error(`Invalid Priority: Must be one of ${validPriorities.join(', ')}`);
    }

    return {
        Title: title,
        Description: Description || undefined,
        Status: Status || 'Open',
        Priority: Priority || 'Medium',
        ProjectID,
        ReportedBy: ReportedBy || undefined,
        AssignedTo: AssignedTo || undefined
    };
};

const validateAndParseUpdateBugData = (body: any): UpdateBug => {
    const { Title, Description, Status, Priority, AssignedTo } = body ?? {};

    if (Title !== undefined && (typeof Title !== 'string' || Title.trim().length === 0)) {
        throw new Error("Invalid Title: Must be non-empty string");
    }

    // Validate status if provided
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (Status && !validStatuses.includes(Status)) {
        throw new Error(`Invalid Status: Must be one of ${validStatuses.join(', ')}`);
    }

    // Validate priority if provided
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (Priority && !validPriorities.includes(Priority)) {
        throw new Error(`Invalid Priority: Must be one of ${validPriorities.join(', ')}`);
    }

    return {
        Title: Title ? Title.trim() : undefined,
        Description,
        Status,
        Priority,
        AssignedTo
    };
};

// Get all bugs
export const getAllBugs = async (req: Request, res: Response) => {
    try {
        const bugs: Bug[] = await BugRepository.getAllBugs();
        return res.status(200).json(bugs);
    } catch (error: any) {
        console.error('Error fetching bugs:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get bug by ID
export const getBugById = async (req: Request, res: Response) => {
    try {
        const bugId = parseInt(req.params.id, 10);
        if (isNaN(bugId)) {
            return res.status(400).json({ message: 'Invalid bug ID' });
        }

        const bug: Bug | null = await BugRepository.getBugById(bugId);
        if (!bug) {
            return res.status(404).json({ message: 'Bug not found' });
        }

        return res.status(200).json(bug);
    } catch (error: any) {
        console.error('Error fetching bug by ID:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get bugs by project
export const getBugsByProject = async (req: Request, res: Response) => {
    try {
        const projectId = parseInt(req.params.projectId, 10);
        if (isNaN(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        const bugs: Bug[] = await BugRepository.getBugsByProject(projectId);
        return res.status(200).json(bugs);
    } catch (error: any) {
        console.error('Error fetching bugs by project:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get bugs by assignee
export const getBugsByAssignee = async (req: Request, res: Response) => {
    try {
        const assigneeId = parseInt(req.params.assigneeId, 10);
        if (isNaN(assigneeId)) {
            return res.status(400).json({ message: 'Invalid assignee ID' });
        }

        const bugs: Bug[] = await BugRepository.getBugsByAssignee(assigneeId);
        return res.status(200).json(bugs);
    } catch (error: any) {
        console.error('Error fetching bugs by assignee:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get bugs by reporter
export const getBugsByReporter = async (req: Request, res: Response) => {
    try {
        const reporterId = parseInt(req.params.reporterId, 10);
        if (isNaN(reporterId)) {
            return res.status(400).json({ message: 'Invalid reporter ID' });
        }

        const bugs: Bug[] = await BugRepository.getBugsByReporter(reporterId);
        return res.status(200).json(bugs);
    } catch (error: any) {
        console.error('Error fetching bugs by reporter:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get bugs by status
export const getBugsByStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.params;
        if (!status) {
            return res.status(400).json({ message: 'Status parameter is required' });
        }

        const bugs: Bug[] = await BugRepository.getBugsByStatus(status);
        return res.status(200).json(bugs);
    } catch (error: any) {
        console.error('Error fetching bugs by status:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Create new bug
export const createBug = async (req: Request, res: Response) => {
    console.log("Bug received", req.body);
    if (!req.body) {
        console.log("Bug creation requires body");
        return res.status(400).json({ message: "Please provide bug data" });
    }

    try {
        const newBug = await validateAndParseBugData(req.body);
        console.log("Bug parsed", newBug);

        const createdBug = await BugRepository.createBug(newBug);

        res.status(201).json({
            message: "Bug created successfully",
            bug: createdBug
        });
    } catch (error: any) {
        console.error('Error creating bug:', error);
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
            message: "Failed to create bug",
            error: error.message
        });
    }
};

// Update bug
export const updateBug = async (req: Request, res: Response) => {
    try {
        const bugId = parseInt(req.params.id, 10);
        if (isNaN(bugId)) {
            return res.status(400).json({ message: 'Invalid bug ID' });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No update data provided" });
        }

        const updateData = validateAndParseUpdateBugData(req.body);

        const updatedBug = await BugRepository.updateBug(bugId, updateData);
        if (!updatedBug) {
            return res.status(404).json({ message: "Bug not found" });
        }

        res.json({
            message: "Bug updated successfully",
            bug: updatedBug
        });
    } catch (error: any) {
        console.error('Error updating bug:', error);
        if (error.message.includes('Invalid') ||
            error.message.includes('No fields to update')) {
            return res.status(400).json({
                message: "Validation failed",
                error: error.message
            });
        }
        res.status(500).json({
            message: "Failed to update bug",
            error: error.message
        });
    }
};

// Delete bug
export const deleteBug = async (req: Request, res: Response) => {
    try {
        const bugId = parseInt(req.params.id, 10);
        if (isNaN(bugId)) {
            return res.status(400).json({ message: 'Invalid bug ID' });
        }

        const deleted = await BugRepository.deleteBug(bugId);
        if (!deleted) {
            return res.status(404).json({ message: "Bug not found" });
        }

        res.json({ message: "Bug deleted successfully" });
    } catch (error: any) {
        console.error('Error deleting bug:', error);
        res.status(500).json({
            message: "Failed to delete bug",
            error: error.message
        });
    }
};