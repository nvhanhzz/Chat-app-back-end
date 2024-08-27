import mongoose, { Document, Schema } from "mongoose";
import RoomType from "../../../enums/roomType.enums";

export interface IRoomChat extends Document {
    title: string;
    members: mongoose.Types.ObjectId[];
    type: RoomType;
    avatar?: string;
    // theme?: string;        
    // quickEmojis?: string;  
    deleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RoomChatSchema: Schema = new Schema(
    {
        title: { type: String },
        members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        type: { type: String, enum: Object.values(RoomType) },
        avatar: String,
        // theme: String,  
        // quickEmojis: String, 
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    },
    { timestamps: true }
);

const RoomChat = mongoose.model<IRoomChat>("RoomChat", RoomChatSchema, "roomchats");

export default RoomChat;