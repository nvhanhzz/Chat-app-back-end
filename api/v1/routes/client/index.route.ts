import { Application } from "express";
import authRouter from "./auth.route"
import chatRouter from "./chat.route";
import userRouter from "./user.route";
import { checkToken } from "../../middlewares/client/auth";

const route = (app: Application) => {
    const prefixV1 = process.env.PREFIX_V1;
    const prefixAuth = process.env.PREFIX_AUTH;
    const prefixChat = process.env.PREFIX_CHAT;
    const prefixUser = process.env.PREFIX_USER;

    app.use(checkToken({ tokenName: 'token', type: 'currentUser' }));

    app.use(prefixV1 + prefixAuth, authRouter);
    app.use(prefixV1 + prefixChat, chatRouter);
    app.use(prefixV1 + prefixUser, userRouter);
}

export default route;