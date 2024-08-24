import express, { Router } from "express";
import * as controller from "../../controllers/client/notification.controller";
import { isLoggedIn } from "../../middlewares/client/auth";

const router: Router = express.Router();

router.get(
    "/",
    isLoggedIn,
    controller.index
);

export default router;