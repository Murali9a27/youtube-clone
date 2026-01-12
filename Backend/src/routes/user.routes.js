import { Router } from "express";
import {
    changeUserPassword, 
    getCurrentUser, 
    getUserChannelProfile,
    loginUser, 
    logoutUser,
    logoutFromAllDevices, 
    refreshAccessToken,
    registerUser, 
    updateUserAvatar, 
    updateUserCoverImage, 
    updateUserDetails
} from '../controllers/user.controller.js'
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
router.route("/logout-all").post( verifyJWT,logoutFromAllDevices);

router.route('/refresh-token').post( refreshAccessToken)
router.route('/change-password').patch(verifyJWT, changeUserPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT, updateUserDetails)
router.route('/update-avatar').patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route('/update-coverImage').patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route('/channel/:username').get(verifyJWT, getUserChannelProfile)

export default router