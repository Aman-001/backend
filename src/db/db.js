/*
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Connected ${connectionInstance.connection.host}`);
    }catch(err){
        console.log("MOGODB connection error ", err);
        throw err;
        process.exit(1);
    }
}

export default connectDB;
*/

import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
  try {
    const dbUri = `${process.env.MONGODB_URI}/${DB_NAME}`;
    console.log('Connecting to MongoDB with URI:', dbUri); // Log the connection string
    const connectionInstance = await mongoose.connect(dbUri);
    console.log(`Connected to ${connectionInstance.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

export default connectDB;