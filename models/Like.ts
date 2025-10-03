import mongoose, { models, Schema } from "mongoose";

export interface likeInterface {
    _id?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId | string;
    postId: mongoose.Types.ObjectId | string;
    createdAt?: Date;
}

const likeSchema = new Schema<likeInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true }
  },
  { timestamps: true }
);

likeSchema.index({ userId: 1, postId: 1 }, { unique: true });
const Like = models?.Like || mongoose.model<likeInterface>("Like",likeSchema);

export default Like;