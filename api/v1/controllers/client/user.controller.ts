import { Request, Response } from "express";
import User from "../../models/user.model";

// [GET] /api/v1/user/suggest-friend
export const suggestFriend = async (req: Request & { currentUser?: any }, res: Response): Promise<Response> => {
    try {
        const currentUser = req.currentUser;

        const suggestUsers = await User.find({
            _id: {
                $ne: currentUser._id,
                $nin: [
                    ...currentUser.friendList,
                    ...currentUser.receivedFriendRequests,
                    ...currentUser.sentFriendRequests
                ]
            }
        }).select("fullName avatar slug");

        return res.status(200).json(suggestUsers);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Lỗi server." });
    }
}

// [GET] /api/v1/user/recive-friend-request
export const getListRecivedFriendRequest = async (req: Request & { currentUser?: any }, res: Response): Promise<Response> => {
    try {
        const currentUser = req.currentUser;

        const users = await User.find({
            _id: {
                $in: currentUser.receivedFriendRequests
            }
        }).select("fullName avatar slug");

        return res.status(200).json(users);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Lỗi server." });
    }
}

// [GET] /api/v1/user/sent-friend-request
export const getListSentFriendRequest = async (req: Request & { currentUser?: any }, res: Response): Promise<Response> => {
    try {
        const currentUser = req.currentUser;

        const users = await User.find({
            _id: {
                $in: currentUser.sentFriendRequests
            }
        }).select("fullName avatar slug");

        return res.status(200).json(users);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Lỗi server." });
    }
}