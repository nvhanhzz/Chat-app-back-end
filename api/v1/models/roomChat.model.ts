import { default as mongoose } from "mongoose";
import RoomType from "../../../enums/roomType.enums";

const RoomChatSchema: mongoose.Schema = new mongoose.Schema(
    {
        title: String,
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        type: { type: String, enum: Object.values(RoomType) },
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

const RoomChat = mongoose.model("RoomChat", RoomChatSchema, "roomchats");

export default RoomChat;