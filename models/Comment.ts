import mongoose, { models, Schema } from "mongoose";

export interface CommentInterface {
  _id?: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;   
  userId: mongoose.Types.ObjectId;  
  content: string;
  parentId?: mongoose.Types.ObjectId; // for replies (null if top-level comment)
  likesCount?: number; 
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema<CommentInterface>({
    postId:{
        type:Schema.Types.ObjectId,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    parentId:{
        type:Schema.Types.ObjectId,
        default:null
    },
    likesCount:{
        type:Number,
        default:0
    }
},{timestamps:true});

const Comment = models?.Comment || mongoose.model<CommentInterface>("Comment",commentSchema);

export default Comment;
