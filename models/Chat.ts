import { Schema, model, models, Types } from "mongoose";

export interface ChatInterface {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  isGroupChat: boolean;
  chatName?: string;
  chatImage?: string;
  admins?: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  lastMessageTime?: Date;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const chatSchema = new Schema<ChatInterface>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  isGroupChat: {
    type: Boolean,
    default: false
  },
  chatName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  chatImage: {
    type: String,
    default: ""
  },
  admins: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: "Message"
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageTime: -1 });

// Virtual for unread count (can be computed on client side)
chatSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

const Chat = models?.Chat || model<ChatInterface>("Chat", chatSchema);

export default Chat;