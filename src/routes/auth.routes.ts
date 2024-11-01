import { registerUser } from "@src/controllers/auth.controllers.js";
import { Router } from "express";

const router = Router();

router.post("/register", registerUser);

export default router;
