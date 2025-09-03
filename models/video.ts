import { Schema, model, models, Types } from "mongoose";

export const videoDimension = {
  width: 1080,
  height: 1920,
} as const;

export interface videoInterface {
  _id: Types.ObjectId;
  userId: string;
  username?: string;
  title: string;
  description: string;
  videoUrl: string;
  controls?: boolean;
  likes: Types.ObjectId[];
  likeCount?: number;
  transformation?: {
    height: number;
    width: number;
    quality?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<videoInterface>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    controls: { type: Boolean, default: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }], 
    transformation: {
      height: { type: Number, default: videoDimension.height },
      width: { type: Number, default: videoDimension.width },
      quality: { type: Number, min: 1, max: 100, default: 80 },
    },
  },
  { timestamps: true }
);


const Video = models?.Video || model<videoInterface>("Video", videoSchema);

export default Video;