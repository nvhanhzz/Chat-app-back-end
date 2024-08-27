import mongoose, { Document, Schema } from "mongoose";
import ListType from "../../../enums/notificationType.enums";
import { IUser } from "./user.model";

export interface INotification extends Document {
    senderId: IUser["_id"];
    receiverId: IUser["_id"];
    type: ListType;
    isRead: boolean;
    linkTo?: string;
    deleted: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new mongoose.Schema(
    {
        senderId: { type: Schema.Types.ObjectId, ref: 'User' },
        receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
        type: {
            type: String,
            enum: Object.values(ListType),
            required: true
        },
        isRead: { type: Boolean, default: false },
        linkTo: { type: String },
        deleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }
);

const Notification = mongoose.model<INotification>("Notification", NotificationSchema, "notifications");

export default Notification;