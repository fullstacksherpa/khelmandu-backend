import { bookVenue, getVenues } from "@src/controllers/venue-controllers.js";
import { verifyJWT } from "@src/middlewares/verifyJWT.middleware.js";
import { Router } from "express";

const router = Router();

router.get("/venues", getVenues);

router.post("/book", verifyJWT, bookVenue);

export default router;
