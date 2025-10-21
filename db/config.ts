import mssql from 'mssql';

// Configure the pool using environment variables (fallbacks provided for local dev)
export const pool = new mssql.ConnectionPool({
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Your_password123',
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'BugTracker',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});

const poolConnect = pool.connect();

/**
 * Export a minimal `sql` helper that supports tagged-template usage like:
 *   await sql.query`SELECT * FROM Comments WHERE CommentID = ${id}`
 *
 * This implementation parameterizes values as @p0, @p1, ... to avoid SQL injection.
 */
export const sql = {
  query: async (queryParts: TemplateStringsArray, ...values: any[]) => {
    await poolConnect;

    // Build parameterized query text by inserting @p{index} placeholders
    let text = '';
    for (let i = 0; i < queryParts.length; i++) {
      text += queryParts[i];
      if (i < values.length) {
        text += `@p${i}`;
      }
    }

    const request = pool.request();
    values.forEach((v, i) => request.input(`p${i}`, v));

    const result = await request.query(text);
    return result;
  },
  Request: mssql.Request,
};