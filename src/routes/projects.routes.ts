import type { Express } from "express";
import * as projectController from "../controllers/project.controller";
import { requireAuth } from "../middleware/auth.middleware";

const projectRoutes = (app:Express) => {
    // GET /projects - Retrieve all projects
    app.get('/projects', requireAuth, projectController.getAllProjectsController);

    // GET /projects/:id - Retrieve a specific project by ID
    app.get('/projects/:id', requireAuth, projectController.getProjectByIdController);

    // GET /projects/creator/:creatorId - Retrieve projects by creator
    app.get('/projects/creator/:creatorId', requireAuth, projectController.getProjectsByCreatorController);

    // POST /projects - Create a new project
    app.post('/projects', requireAuth, projectController.createProjectController);

    // PUT /projects/:id - Update an existing project
    app.put('/projects/:id', requireAuth, projectController.updateProjectController);

    // DELETE /projects/:id - Delete a project
    app.delete('/projects/:id', requireAuth, projectController.deleteProjectController);
}

export default projectRoutes;