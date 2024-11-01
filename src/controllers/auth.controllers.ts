import { Request, Response } from "express";
import User from "@src/models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export async function registerUser(req: Request, res: Response) {
  try {
    const userData = req.body;

    const newUser = new User(userData);

    await newUser.save();

    const secretKey = crypto.randomBytes(32).toString("hex");

    const token = jwt.sign({ userId: newUser._id }, secretKey);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error creating user", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
