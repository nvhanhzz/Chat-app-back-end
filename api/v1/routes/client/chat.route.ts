import express, { Router } from "express";
import * as controller from "../../controllers/client/chat.controller";
// import * as validate from '../../validate/client/chat.validate';
import { isLoggedIn } from "../../middlewares/client/auth";

const router: Router = express.Router();

router.get(
    "/",
    isLoggedIn,
    controller.index
);

export default router;