-- Add CASCADE DELETE for Projects -> Bugs (when a project is deleted, delete associated bugs)
ALTER TABLE Bugs
ADD CONSTRAINT bugs_projectid_fkey
    FOREIGN KEY (projectid)
    REFERENCES Projects(projectid)
    ON DELETE CASCADE;

ALTER TABLE Projects
DROP CONSTRAINT projects_createdby_fkey;
ALTER TABLE Projects
ADD CONSTRAINT projects_createdby_fkey
FOREIGN KEY (createdby) REFERENCES Users(userid) ON DELETE SET NULL;

ALTER TABLE Projects
DROP CONSTRAINT projects_assignedto_fkey;
ALTER TABLE Projects
ADD CONSTRAINT projects_assignedto_fkey
FOREIGN KEY (assignedto) REFERENCES Users(userid) ON DELETE SET NULL;

ALTER TABLE Bugs
DROP CONSTRAINT bugs_assignedto_fkey;
ALTER TABLE Bugs
ADD CONSTRAINT bugs_assignedto_fkey
FOREIGN KEY (assignedto) REFERENCES Users(userid) ON DELETE SET NULL;

ALTER TABLE Bugs
DROP CONSTRAINT bugs_reportedby_fkey;
ALTER TABLE Bugs
ADD CONSTRAINT bugs_reportedby_fkey
FOREIGN KEY (reportedby) REFERENCES Users(userid) ON DELETE SET NULL;
