import express, { Router } from "express";
import * as controller from "../../controllers/client/user.controller";
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

router.get(
    "/friend-list",
    isLoggedIn,
    controller.getFriendList
);

export default router;