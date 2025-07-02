import mongoose from 'mongoose'
import { ENV } from './env.js'

export const connectDB = async ()=>{
    try{
        await mongoose.connect(ENV.MONGO_URI);
        console.log('Connected to Database successfully ✅')
    }catch(err){
        console.log('error connecting to database')
        process.exit(1)
    }
}