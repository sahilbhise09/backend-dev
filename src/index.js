// require('dotenv').config({path : './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path :'./env'
})























/*
import express from 'express'
const app = express();

(async ()=>{
    try{
        await mongoose.connect(`process.env.${MONGODB_URL}/${DB_NAME}`);
        app.on("error", ()=>{
            console.log("Error: ", error);
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch(error){
        console.log("error: ", error );
        throw error
    }
})()*/