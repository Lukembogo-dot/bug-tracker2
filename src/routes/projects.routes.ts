import type { Express } from "express";
import * as projectController from "../controllers/project.controller";
import { requireAuth } from "../middleware/auth.middleware";

const projectRoutes = (app:Express) => {
    // GET /projects - Retrieve all projects
    app.get('/api/projects', requireAuth, projectController.getAllProjectsController);

    // GET /projects/:id - Retrieve a specific project by ID
    app.get('/api/projects/:id', requireAuth, projectController.getProjectByIdController);

    // GET /projects/assignee/:assigneeId - Retrieve projects by assignee
    app.get('/api/projects/assignee/:assigneeId', requireAuth, projectController.getProjectsByAssigneeController);

    // POST /projects - Create a new project (admin only)
    app.post('/api/projects', requireAuth, projectController.createProjectController);

    // PUT /projects/:id - Update an existing project
    app.put('/api/projects/:id', requireAuth, projectController.updateProjectController);

    // DELETE /projects/:id - Delete a project
    app.delete('/api/projects/:id', requireAuth, projectController.deleteProjectController);
}

export default projectRoutes;