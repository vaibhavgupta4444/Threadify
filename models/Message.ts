import mongoose, { Schema, model, models, Types } from "mongoose";

export interface MessageInterface {
  _id: Types.ObjectId;
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'file';
  mediaUrl?: string;
  replyTo?: Types.ObjectId;
  readBy: {
    user: Types.ObjectId;
    readAt: Date;
  }[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<MessageInterface>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'file'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    default: ""
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: "Message"
  },
  readBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for read status
messageSchema.virtual('isRead').get(function() {
  return this.readBy.length > 0;
});

// Pre-save middleware to update chat's last message
messageSchema.post('save', async function() {
  try {
    const Chat = mongoose.model('Chat');
    await Chat.findByIdAndUpdate(this.chatId, {
      lastMessage: this._id,
      lastMessageTime: this.createdAt
    });
  } catch (error) {
    console.error('Error updating chat last message:', error);
  }
});

const Message = models?.Message || model<MessageInterface>("Message", messageSchema);

export default Message;