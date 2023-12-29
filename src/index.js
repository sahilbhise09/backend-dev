// require('dotenv').config({path : './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: './env'
})

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port: ${process.env.PORT}`);
      app.on("error", (error) => {
        console.log("Error: ", error);
        throw error;
      })
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed!! ", err);
  })























/*
import express from 'express';
import mongoose from 'mongoose';

const app = express();

(async () => {
  try {
    // Replace MONGODB_URL and DB_NAME with your actual values
    await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
    app.on("error", (error)=>{
        console.log("error: ", error);
        throw error
    })

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
})();
*/