// require('dotenv').config({path : './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path :'./env'
})

connectDB();























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