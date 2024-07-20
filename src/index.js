import mongoose from "mongoose";
import {DB_NAME} from "../src/constants.js"
import dotenv from 'dotenv';
import connectDB from './db/db.js';  // Adjust the path as necessary
import {app} from "./app.js"

dotenv.config({
    path: './.env'
});

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at ${process.env.PORT || 8000}`);
    })
})
.catch((error) => {
    console.log("CONNECTION FAILED" , error)
})




//First approach using iifee
/*
import express from "express"
const app = express();
//IFEES
(async ()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",(error)=>{
        console.log("ERROR:",error);
        process.exit(1);
       })
       app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${process.env.PORT}`);
       })
    }catch(error){
        console.error("ERROR:",error)
        
    }
})()
*/



