import { loginUser, registerUser } from "@src/controllers/auth.controllers.js";
import { upload } from "@src/middlewares/multer.middleware";
import { Router } from "express";

const router = Router();

router.post(
  "/register",
  upload.fields([{ name: "image", maxCount: 1 }]),
  registerUser
);
router.post("/login", loginUser);

export default router;
