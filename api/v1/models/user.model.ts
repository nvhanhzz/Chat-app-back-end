import mongoose from "mongoose";

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
        status: String
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

export default User;