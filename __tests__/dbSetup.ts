import { getPool } from '../db/config';

export const setupDatabase = async () => {
  const pool = await getPool();

  try {
    // Check if Users table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'users'
      );
    `);

    if (!result.rows[0].exists) {
      console.log('Setting up database tables...');

      // Create tables
      await pool.query(`
        CREATE TABLE IF NOT EXISTS Users (
          UserID SERIAL PRIMARY KEY,
          Username VARCHAR(100) NOT NULL,
          Email VARCHAR(150) UNIQUE NOT NULL,
          PasswordHash VARCHAR(255) NOT NULL,
          Role VARCHAR(50) DEFAULT 'User',
          CreatedAt TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS Projects (
          ProjectID SERIAL PRIMARY KEY,
          ProjectName VARCHAR(150) NOT NULL,
          Description TEXT,
          CreatedBy INT NOT NULL,
          AssignedTo INT NULL,
          CreatedAt TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
          FOREIGN KEY (AssignedTo) REFERENCES Users(UserID)
        );

        CREATE TABLE IF NOT EXISTS Bugs (
          BugID SERIAL PRIMARY KEY,
          Title VARCHAR(200) NOT NULL,
          Description TEXT,
          Status VARCHAR(50) DEFAULT 'Open',
          Priority VARCHAR(50) DEFAULT 'Medium',
          ProjectID INT NOT NULL,
          ReportedBy INT NULL,
          AssignedTo INT NULL,
          CreatedAt TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID),
          FOREIGN KEY (ReportedBy) REFERENCES Users(UserID) ON DELETE SET NULL,
          FOREIGN KEY (AssignedTo) REFERENCES Users(UserID)
        );

        CREATE TABLE IF NOT EXISTS Comments (
          CommentID SERIAL PRIMARY KEY,
          BugID INT NOT NULL,
          UserID INT NOT NULL,
          CommentText TEXT NOT NULL,
          CreatedAt TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (BugID) REFERENCES Bugs(BugID) ON DELETE CASCADE,
          FOREIGN KEY (UserID) REFERENCES Users(UserID)
        );
      `);

      console.log('Database tables created successfully');
    } else {
      console.log('Database tables already exist');
    }
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
};

export const teardownDatabase = async () => {
  const pool = await getPool();

  try {
    // Clear test data
    await pool.query('DELETE FROM Comments');
    await pool.query('DELETE FROM Bugs');
    await pool.query('DELETE FROM Projects');
    await pool.query('DELETE FROM Users WHERE Email LIKE \'%test%\' OR Email LIKE \'%bugtest%\' OR Email LIKE \'%login%\'');
    console.log('Test data cleaned up');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
};