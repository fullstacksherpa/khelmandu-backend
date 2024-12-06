import {
  getUser,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  requestPasswordReset,
  resetPassword,
  uploadProfilePic,
  verifyEmail,
} from "@src/controllers/auth.controllers.js";
import { upload } from "@src/middlewares/multer.middleware";
import { verifyJWT } from "@src/middlewares/verifyJWT.middleware";

import { Router } from "express";

const router = Router();

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/user/:userId", getUser);

router.post("/refresh-token", refreshToken);

// Route to upload profile picture
router.post(
  "/upload-profile-pic",
  verifyJWT,
  upload.single("profilePic"),
  uploadProfilePic
);

router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
export default router;
