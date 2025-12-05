-- Migration to add AssignedTo column to Projects table
-- Run this in your PostgreSQL database

ALTER TABLE Projects ADD AssignedTo INT NULL;
ALTER TABLE Projects ADD CONSTRAINT fk_projects_assignedto FOREIGN KEY (AssignedTo) REFERENCES Users(UserID);

-- Update existing projects with some default assignees (optional)
-- You can modify these based on your needs
UPDATE Projects SET AssignedTo = 2 WHERE ProjectID = 1;
UPDATE Projects SET AssignedTo = 3 WHERE ProjectID = 2;
UPDATE Projects SET AssignedTo = 4 WHERE ProjectID = 3;