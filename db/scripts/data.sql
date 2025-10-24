-- ...existing code...

/*
  Safe reset + seed script for SQL Server.
  - Drops tables if they exist (correct order for FKs)
  - Recreates tables
  - Inserts sample data (fixed Comments insert)
  Run in SSMS, sqlcmd, or your preferred SQL client.
*/

-- Drop tables in correct order to avoid FK errors
DROP TABLE IF EXISTS dbo.Comments;
DROP TABLE IF EXISTS dbo.Bugs;
DROP TABLE IF EXISTS dbo.Projects;
DROP TABLE IF EXISTS dbo.Users;

-- 1. USERS TABLE
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) DEFAULT 'User',
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 2. PROJECTS TABLE
CREATE TABLE Projects (
    ProjectID INT IDENTITY(1,1) PRIMARY KEY,
    ProjectName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX),
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

-- 3. BUGS TABLE
CREATE TABLE Bugs (
    BugID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    Status NVARCHAR(50) DEFAULT 'Open',
    Priority NVARCHAR(50) DEFAULT 'Medium',
    ProjectID INT NOT NULL,
    ReportedBy INT NULL,
    AssignedTo INT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID),
    FOREIGN KEY (ReportedBy) REFERENCES Users(UserID) ON DELETE SET NULL,
    FOREIGN KEY (AssignedTo) REFERENCES Users(UserID)
);

-- 4. COMMENTS TABLE
CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1) PRIMARY KEY,
    BugID INT NOT NULL,
    UserID INT NOT NULL,
    CommentText NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (BugID) REFERENCES Bugs(BugID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Optional: use TRUNCATE + reseed if you prefer to keep schemas and only clear data
-- TRUNCATE TABLE Comments; TRUNCATE TABLE Bugs; TRUNCATE TABLE Projects; TRUNCATE TABLE Users;
-- DBCC CHECKIDENT ('Users', RESEED, 0);
-- DBCC CHECKIDENT ('Projects', RESEED, 0);
-- DBCC CHECKIDENT ('Bugs', RESEED, 0);
-- DBCC CHECKIDENT ('Comments', RESEED, 0);

-- Insert sample data into Users table
INSERT INTO Users (Username, Email, PasswordHash, Role)
VALUES
('LukeMbogo', 'luke@example.com', 'hashed_password_1', 'Admin'),
('JaneDoe', 'jane@example.com', 'hashed_password_2', 'Developer'),
('JohnDev', 'john@example.com', 'hashed_password_3', 'Tester'),
('SarahQA', 'sarah@example.com', 'hashed_password_4', 'QA Engineer');

-- Insert sample data into Projects table
INSERT INTO Projects (ProjectName, Description, CreatedBy, CreatedAt)
VALUES
('E-Farm', 'AI-powered digital farming management system', 1, GETDATE()),
('Autofix', 'Garage and mechanic booking platform', 1, GETDATE()),
('SportsHub', 'Athlete management and event tracking system', 2, GETDATE());

-- Insert sample data into Bugs table
INSERT INTO Bugs (Title, Description, Status, Priority, ProjectID, ReportedBy, AssignedTo)
VALUES
('Login button not responding', 'Users cannot log in after pressing the button', 'Open', 'High', 1, 1, 2),
('Broken image on homepage', 'Hero section image fails to load intermittently', 'In Progress', 'Medium', 1, 3, 2),
('Payment gateway timeout', 'Transaction API returns 504 Gateway Timeout', 'Open', 'Critical', 2, 2, 1),
('Dashboard crash on load', 'Uncaught exception when loading user dashboard', 'Resolved', 'High', 3, 4, 3);

-- Insert sample data into Comments table (fixed)
INSERT INTO Comments (BugID, UserID, CommentText)
VALUES
(1, 2, 'Investigating login button issue.'),
(2, 4, 'Image cache cleared, monitoring.'),
(3, 1, 'Raised with payments team.'),
(4, 3, 'Patch deployed, verify.');

-- Quick verification
SELECT * FROM Users;
SELECT * FROM Projects;
SELECT * FROM Bugs;
SELECT * FROM Comments;

-- ...existing code...