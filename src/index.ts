import dotenv from 'dotenv';
import express from 'express';
import { getPool } from '../db/config';
const  app = express();
dotenv.config();

const sqlConfig = {
  server: process.env.SQL_SERVER,
  user: process.env.SQL_USER,
  password: process.env.SQL_PWD,
  database: process.env.SQL_DB,
};

app.listen(3000, async () => {
  console.log("Starting server...");
  try {
    const dbConnected = await getPool();
    if(dbConnected){
      console.log("Server is running on localhost://3000 🌐");
      console.log("Database connected Successfully✅");
    }
    else{
      console.log("Database connection error❌");
    }
  } catch (error) {
    console.log("Error starting the server", error);
  }
});
