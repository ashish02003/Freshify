import mongoose from "mongoose";
import dotenv from "dotenv";

   dotenv.config();

if(!process.env.MONGODB_URI){    //check if mongoDB_URI is available or not..if not available then throw new error

    throw new Error("please provide MONGODB_URI in the .env file")
}

async function connectDB(){

    try {
        await mongoose.connect(process.env.MONGODB_URI)//if mongoDB_URI is available then connect it
        console.log("connected DB...🎉🤗") 
    } catch (error) {
       console.log("MongoDB connect error is : ",error) 
       process.exit(1) //if my database is not connect with mongoDB database..then stop the server
    }
}


export default connectDB