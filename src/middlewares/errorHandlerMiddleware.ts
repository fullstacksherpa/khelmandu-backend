import { Request, Response, NextFunction } from "express";

// Centralized error-handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack); // Log the error stack trace for debugging

  // Custom error response
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message || "Internal Server Error",
  });
};
