import { loginUser, registerUser } from "@src/controllers/auth.controllers.js";
import { upload } from "@src/middlewares/multer.middleware";
import { Router } from "express";

const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: "image", maxCount: 1 }, // Accept a single file upload for the avatar
    // You can keep the coverImage field here, or remove it if not needed
    // { name: "coverImage", maxCount: 1 }, // Uncomment if you want to allow cover image upload
  ]),
  registerUser
);
router.post("/login", loginUser);

export default router;
