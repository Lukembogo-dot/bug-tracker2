import type { Express } from "express";
import * as bugController from "../controllers/bug.controller";

const bugRoutes = (app:Express) => {
    // GET /api/bugs - Retrieve all bugs
    app.get('/api/bugs', bugController.getAllBugsController);

    // GET /api/bugs/:id - Retrieve a specific bug by ID
    app.get('/api/bugs/:id', bugController.getBugByIdController);

    // GET /api/bugs/project/:projectId - Retrieve bugs for a specific project
    app.get('/api/bugs/project/:projectId', bugController.getBugsByProjectController);

    // GET /api/bugs/assignee/:assigneeId - Retrieve bugs assigned to a user
    app.get('/api/bugs/assignee/:assigneeId', bugController.getBugsByAssigneeController);

    // GET /api/bugs/reporter/:reporterId - Retrieve bugs reported by a user
    app.get('/api/bugs/reporter/:reporterId', bugController.getBugsByReporterController);

    // GET /api/bugs/status/:status - Retrieve bugs by status
    app.get('/api/bugs/status/:status', bugController.getBugsByStatusController);

    // POST /api/bugs - Create a new bug
    app.post('/api/bugs', bugController.createBugController);

    // PUT /api/bugs/:id - Update an existing bug
    app.put('/api/bugs/:id', bugController.updateBugController);

    // DELETE /api/bugs/:id - Delete a bug
    app.delete('/api/bugs/:id', bugController.deleteBugController);
}

export default bugRoutes;