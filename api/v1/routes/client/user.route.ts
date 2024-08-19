import express, { Router } from "express";
import * as controller from "../../controllers/client/user.controller";
// import * as validate from '../../validate/client/chat.validate';
import { isLoggedIn } from "../../middlewares/client/auth";

const router: Router = express.Router();

router.get(
    "/suggest-friend",
    isLoggedIn,
    controller.suggestFriend
);

router.get(
    "/recive-friend-request",
    isLoggedIn,
    controller.getListRecivedFriendRequest
);

router.get(
    "/sent-friend-request",
    isLoggedIn,
    controller.getListSentFriendRequest
);

export default router;