import dotenv from 'dotenv';
import express from 'express';
const  app = express();
dotenv.config();

const sqlConfig = {
  server: process.env.SQL_SERVER,
  user: process.env.SQL_USER,
  password: process.env.SQL_PWD,
  database: process.env.SQL_DB,
};

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
