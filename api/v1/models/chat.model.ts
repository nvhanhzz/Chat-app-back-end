import mongoose, { Document, Schema } from "mongoose";
import User, { IUser } from "./user.model";
import { IRoomChat } from "./roomChat.model";

export interface IChat extends Document {
    userId: IUser["_id"];
    roomChatId: IRoomChat["_id"];
    content?: string;
    images?: string[];
    deleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const chatSchema: Schema<IChat> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: User },
        roomChatId: { type: Schema.Types.ObjectId, ref: 'RoomChat' },
        content: { type: String, default: '' },
        images: { type: [String], default: [] },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    },
    { timestamps: true }
);

const Chat = mongoose.model<IChat>("Chat", chatSchema, "chats");

export default Chat;