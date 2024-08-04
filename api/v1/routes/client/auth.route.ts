import express, { Router } from "express";
import * as controller from "../../controllers/client/auth.controller";
import * as validate from '../../validate/client/auth.validate';
import { isLoggedIn } from "../../middlewares/client/auth";

const router: Router = express.Router();

router.get(
    "/checkLoggedIn",
    isLoggedIn,
    controller.checkLoggedIn
)

router.post(
    "/register",
    validate.register,
    controller.register
);

export default router;