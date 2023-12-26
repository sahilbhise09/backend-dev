import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017'}/${DB_NAME}`);
        console.log(`\n MongoDB connected!! DB HOST: ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("MONGODB connection error ", error);
        process.exit(1);
    }
}

export default connectDB;































// import mongoose from 'mongoose';
// import { DB_NAME } from './constants';
// import express from 'express'
// const app = express();

// (async ()=>{
//     try{
//         await mongoose.connect(`process.env.${MONGODB_URL}/${DB_NAME}`);
//         app.on("error", ()=>{
//             console.log("Error: ", error);
//         })

//         app.listen(process.env.PORT, ()=>{
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })
//     } catch(error){
//         console.log("error: ", error );
//         throw error
//     }
// })()