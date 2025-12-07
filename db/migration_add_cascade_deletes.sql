-- Migration to add CASCADE DELETE constraints for proper data integrity
-- Run this in your PostgreSQL database after the initial schema setup

-- Add CASCADE DELETE for Projects -> Bugs (when a project is deleted, delete associated bugs)
ALTER TABLE Bugs
DROP CONSTRAINT bugs_projectid_fkey;

ALTER TABLE Bugs
ADD CONSTRAINT bugs_projectid_fkey
    FOREIGN KEY (ProjectID)
    REFERENCES Projects(ProjectID)
    ON DELETE CASCADE;

-- Optional: Add CASCADE DELETE for Users -> Projects (when a user is deleted, delete their projects)
-- Uncomment the following if you want users to be deletable with their projects
-- ALTER TABLE Projects
-- DROP CONSTRAINT projects_createdby_fkey,
-- ADD CONSTRAINT projects_createdby_fkey
--     FOREIGN KEY (CreatedBy)
--     REFERENCES Users(UserID)
--     ON DELETE CASCADE;

-- Note: Comments already have ON DELETE CASCADE on BugID
-- AssignedTo and ReportedBy in Bugs have ON DELETE SET NULL