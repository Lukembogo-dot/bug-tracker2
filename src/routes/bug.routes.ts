import type { Express } from "express";
import * as bugController from "../controllers/bug.controller";
import { requireAuth } from "../middleware/auth.middleware";

const bugRoutes = (app:Express) => {
    // GET /bugs - Retrieve all bugs
    app.get('/bugs', requireAuth, bugController.getAllBugsController);

    // GET /bugs/:id - Retrieve a specific bug by ID
    app.get('/bugs/:id', requireAuth, bugController.getBugByIdController);

    // GET /bugs/project/:projectId - Retrieve bugs for a specific project
    app.get('/bugs/project/:projectId', requireAuth, bugController.getBugsByProjectController);

    // GET /bugs/assignee/:assigneeId - Retrieve bugs assigned to a user
    app.get('/bugs/assignee/:assigneeId', requireAuth, bugController.getBugsByAssigneeController);

    // GET /bugs/reporter/:reporterId - Retrieve bugs reported by a user
    app.get('/bugs/reporter/:reporterId', requireAuth, bugController.getBugsByReporterController);

    // GET /bugs/status/:status - Retrieve bugs by status
    app.get('/bugs/status/:status', requireAuth, bugController.getBugsByStatusController);

    // POST /bugs - Create a new bug
    app.post('/bugs', requireAuth, bugController.createBugController);

    // PUT /bugs/:id - Update an existing bug
    app.put('/bugs/:id', requireAuth, bugController.updateBugController);

    // DELETE /bugs/:id - Delete a bug
    app.delete('/bugs/:id', requireAuth, bugController.deleteBugController);
}

export default bugRoutes;