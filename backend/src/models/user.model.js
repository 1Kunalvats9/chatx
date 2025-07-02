import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema(
    {
        clerkId:{
            type:String,
            unique:true,
        },
        email:{
            type:String,
            unique:true,
        },
        username:{
            type:String,
            unique:true,
        },
        profilePicture:{
            type:String,
            default:"",
        },
        bannerImage:{
            type:String,
            default:"",
        },
        bio:{
            type:String,
            default:"",
            maxLength:160
        },
        location:{
            type:String,
            default:"",
        },
        followers:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            }
        ],
        following:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            }
        ]
    },
    {timestamps:true}
)

const User = mongoose.model('User',userSchema);
export default User