import mongoose, {model, models, Schema} from "mongoose";
import bcrypt from "bcryptjs";

export interface UserInterface{
    _id?:mongoose.Types.ObjectId;
    image?: string,
    username:string;
    firstName?:string;
    lastName?:string;
    bio?:string;
    followers?: mongoose.Types.ObjectId[];
    following?: mongoose.Types.ObjectId[];
    isPrivate?: boolean;
    verified?: boolean;
    verificationCode?: string;
    codeExpiration?: Date;
    contactNo: string;
    email:string;
    password:string;
    createdAt?:Date;
    updatedAt?:Date;
}

const userSchema = new Schema<UserInterface>({
    image:{type:String,default:""},
    username:{type:String,required:true,unique:true},
    email:{type:String,required:true,unique:true},
    firstName:{type:String,default:""},
    lastName:{type:String,default:""},
    bio:{type:String,default:""},
    followers:[{type:Schema.Types.ObjectId,ref:"User"}],    
    following:[{type:Schema.Types.ObjectId,ref:"User"}],
    isPrivate:{type:Boolean,default:false},
    verified:{type:Boolean,default:false},
    verificationCode:{type:String,default:""},
    codeExpiration:{type:Date},
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