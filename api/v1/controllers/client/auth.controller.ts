import { Request, Response } from "express";
import dotenv from "dotenv";

import User from "../../models/user.model";
import { hashPassword, comparePassword } from "../../../../helper/hashPassword";
import generateToken from "../../../../helper/generateToken";
import ListStatus from "../../../../enums/status.enums";

dotenv.config();
const TOKEN_EXP: number = parseInt(process.env.TOKEN_EXP, 10);

// [GET] /api/v1/auth/checkLoggedIn
export const checkLoggedIn = (req: Request & { currentUser?: object }, res: Response): Response => {
    return res.status(200).json({ message: "Logged in." });
}

// [POST] /api/v1/auth/register
export const register = async (req: Request, res: Response): Promise<Response> => {
    const existUser = await User.findOne({
        email: req.body.email
    });
    if (existUser) {
        return res.status(409).json({ "message": "Email đã được sử dụng." });
    }

    req.body.password = await hashPassword(req.body.password);
    req.body.avatar = '';
    req.body.status = ListStatus.ACTIVE;

    const newUser = new User(req.body);
    const register = await newUser.save();
    if (!register) {
        return res.status(500).json({ "message": "Đăng ký thất bại." });
    }

    generateToken(res, newUser.id, TOKEN_EXP, "token");

    return res.status(200).json({ "message": "Đăng ký thành công." });
}