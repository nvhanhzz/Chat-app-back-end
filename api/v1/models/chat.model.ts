import { default as mongoose } from "mongoose";
import User from "./user.model";

const chatSchema: mongoose.Schema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: User },
        roomChatId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomChat' },
        content: String,
        images: Array,
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema, "chats");

export default Chat;