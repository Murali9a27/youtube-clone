import { Router } from "express";
import {changeUserPassword, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAvatar} from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route('/login').post(loginUser);

// secured Routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/reset-password').post(verifyJWT, changeUserPassword)
router.route('/update-avatar').post(verifyJWT, updateUserAvatar)
export default router