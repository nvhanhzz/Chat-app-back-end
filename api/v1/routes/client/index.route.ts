import { Application } from "express";
import authRouter from "./auth.route"
import { checkToken, isLoggedIn } from "../../middlewares/client/auth";

const route = (app: Application) => {
    const prefixV1 = process.env.PREFIX_V1;
    const prefixAuth = process.env.PREFIX_AUTH;

    app.use(checkToken({ tokenName: 'token', type: 'currentUser' }));

    app.use(prefixV1 + prefixAuth, authRouter);
}

export default route;