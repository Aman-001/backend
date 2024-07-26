import { Router } from "express"
import {
    loginUser,
    LogoutUser,
    registerUser,
    RefreshAccessToken,
    ChangeCurrentPassword,
    getCurrentUser,
    UpdateAccountDetails,
    UpdateUserAvatar,
    UpdateUserCoverImage,
    getChannelProfile,
    getWatchHistory
} from "../controllers/user.controllers.js"
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.route("/register").post(
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
    registerUser)


router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, LogoutUser)
router.route("/refresh-token").post(RefreshAccessToken)
router.route("/change-password").post(verifyJWT, ChangeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, UpdateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), UpdateUserAvatar)
router.route("/cover-Image").patch(verifyJWT, upload.single("/coverImage"), UpdateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router