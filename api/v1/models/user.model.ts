import mongoose, { Document, Schema } from "mongoose";
import slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

export interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    deleted: boolean;
    phone?: string;
    avatar?: string;
    coverImage?: string;
    description?: string;
    slug: string;
    friendList: {
        user_id: mongoose.Types.ObjectId;
    }[];
    sentFriendRequests: mongoose.Types.ObjectId[];
    receivedFriendRequests: mongoose.Types.ObjectId[];
    status?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
    {
        fullName: { type: String },
        email: { type: String, unique: true },
        password: { type: String },
        deleted: { type: Boolean, default: false },
        phone: String,
        avatar: String,
        coverImage: String,
        description: String,
        slug: { type: String, slug: "fullName", unique: true },
        friendList: [
            {
                user_id: { type: Schema.Types.ObjectId, ref: 'User' }
            }
        ],
        sentFriendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        receivedFriendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        status: String
    },
    { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema, "users");

export default User;