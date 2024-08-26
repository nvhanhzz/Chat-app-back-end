import mongoose from "mongoose";
import slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

const userSchema: mongoose.Schema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        deleted: { type: Boolean, default: false },
        phone: String,
        avatar: String,
        coverImage: String,
        description: String,
        slug: { type: String, slug: "fullName", unique: true },
        friendList: [
            {
                user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
            }
        ],
        sentFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        receivedFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        status: String
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

export default User;