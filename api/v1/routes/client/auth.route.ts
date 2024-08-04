import express, { Router } from "express";
import * as controller from "../../controllers/client/auth.controller";
import * as validate from '../../validate/client/auth.validate';
import { isLoggedIn, isLoggedOut } from "../../middlewares/client/auth";

const router: Router = express.Router();

router.get(
    "/checkLoggedIn",
    isLoggedIn,
    controller.checkLoggedIn
);

router.post(
    "/register",
    isLoggedOut,
    validate.register,
    controller.register
);

router.post(
    "/login",
    isLoggedOut,
    validate.login,
    controller.login
);

export default router;