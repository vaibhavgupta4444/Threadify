import mongoose, {model, models, Schema} from "mongoose";
import bcrypt from "bcryptjs";

export interface UserInterface{
    _id?:mongoose.Types.ObjectId;
    profilePic?: string,
    username:string;
    firstName?:string;
    lastName?:string;
    contactNo: string;
    email:string;
    password:string;
    createdAt?:Date;
    updatedAt?:Date;
}

const userSchema = new Schema<UserInterface>({
    username:{type:String,required:true,unique:true},
    email:{type:String,required:true,unique:true},
    contactNo:{type:String,required:true},
    password:{type:String,required:true}
},{timestamps:true})

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = models?.User || model<UserInterface>("User",userSchema);

export default User;