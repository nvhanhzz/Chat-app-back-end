import { default as mongoose } from "mongoose";
import ListType from "../../../enums/notificationType.enums";

const NotificationSchema: mongoose.Schema = new mongoose.Schema(
    {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: {
            type: String,
            enum: Object.values(ListType),
            required: true
        },
        isRead: { type: Boolean, default: false },
        linkTo: { type: String },
        // relatedPostId: {
        //     type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: function () {
        //         return this.type === ListType.COMMENT || this.type === ListType.LIKE;
        //     }
        // },
        // relatedCommentId: {
        //     type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: function () {
        //         return this.type === ListType.LIKE;
        //     }
        // }, 
        deleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }
);

const Notification = mongoose.model("Notification", NotificationSchema, "notifications");

export default Notification;
