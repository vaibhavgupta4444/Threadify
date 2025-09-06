import mongoose, { models, Schema } from "mongoose";

export interface likeInterface {
    _id?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    createdAt?: Date;
}

const likeSchema = new Schema<likeInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true }
  },
  { timestamps: true }
);
const Like = models?.Like || mongoose.model<likeInterface>("Like",likeSchema);

export default Like;