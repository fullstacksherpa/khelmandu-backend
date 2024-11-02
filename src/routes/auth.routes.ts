import {
  loginUser,
  logoutUser,
  registerUser,
} from "@src/controllers/auth.controllers.js";
import { upload } from "@src/middlewares/multer.middleware.js";
import { verifyJWT } from "@src/middlewares/verifyJWT.middleware.js";
import { Router } from "express";

const router = Router();

router.post(
  "/register",
  upload.fields([{ name: "image", maxCount: 1 }]),
  registerUser
);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);

export default router;
