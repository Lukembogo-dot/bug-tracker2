import type { Express } from "express";
import * as projectController from "../controllers/project.controller";

const projectRoutes = (app:Express) => {
    // GET /api/projects - Retrieve all projects
    app.get('/api/projects', projectController.getAllProjectsController);

    // GET /api/projects/:id - Retrieve a specific project by ID
    app.get('/api/projects/:id', projectController.getProjectByIdController);

    // GET /api/projects/creator/:creatorId - Retrieve projects by creator
    app.get('/api/projects/creator/:creatorId', projectController.getProjectsByCreatorController);

    // POST /api/projects - Create a new project
    app.post('/api/projects', projectController.createProjectController);

    // PUT /api/projects/:id - Update an existing project
    app.put('/api/projects/:id', projectController.updateProjectController);

    // DELETE /api/projects/:id - Delete a project
    app.delete('/api/projects/:id', projectController.deleteProjectController);
}

export default projectRoutes;