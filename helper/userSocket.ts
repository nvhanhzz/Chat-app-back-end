import { Socket } from "socket.io";
import User from "../api/v1/models/user.model";
import ListStatus from "../enums/status.enums";
import parseCookies from "./parseCookies";
import verifyToken from "./verifyToken";

export interface UserInterface {
    _id?: string,
    avatar?: string,
    fullName?: string,
    coverImage?: string,
    description?: string,
    email?: string,
    phone?: string,
    receivedFriendRequests?: Array<String>,
    sentFriendRequests?: Array<String>,
    friendList?: Array<{ user_id: string }>
}

const getUser = async (token: string, key: string): Promise<UserInterface | null> => {
    const decoded = verifyToken(token, key);
    try {
        const user: UserInterface | null = await User.findOne({
            _id: decoded.id,
            deleted: false,
            status: ListStatus.ACTIVE
        }).select("-password -status");

        return user;
    } catch (e) {
        console.error('Error fetching user:', e);
        return null;
    }
}

export const checkUser = async (socket: Socket, key: string): Promise<UserInterface | null> => {
    const cookies: string = socket.handshake.headers.cookie || '';
    const parsedCookies = parseCookies(cookies);
    const token = parsedCookies['token'];

    if (token) {
        try {
            const user = await getUser(token, key);
            if (!user) {
                socket.disconnect(true);
                return null;
            }
            return user;
        } catch (error) {
            console.error('Error checking user:', error);
            socket.disconnect(true);
            return null;
        }
    } else {
        socket.disconnect(true);
        return null;
    }
}