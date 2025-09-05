import { Schema, model, models, Types } from "mongoose";

export const postDimension = {
  width: 1080,
  height: 1920,
} as const;

export interface postInterface {
  _id: Types.ObjectId;
  userId: string;
  username?: string;
  title: string;
  description: string;
  likes?: number;
  mediaUrl: string;
  controls?: boolean;
  transformation?: {
    height: number;
    width: number;
    quality?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  userProfilePic?: string;
}

const postSchema = new Schema<postInterface>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    likes: {type:Number, default: 0},
    mediaUrl: { type: String, required: true },
    controls: { type: Boolean, default: true },
    transformation: {
      height: { type: Number, default: postDimension.height },
      width: { type: Number, default: postDimension.width },
      quality: { type: Number, min: 1, max: 100, default: 80 },
    },
  },
  { timestamps: true }
);


const Post = models?.Post || model<postInterface>("Post", postSchema);

export default Post;