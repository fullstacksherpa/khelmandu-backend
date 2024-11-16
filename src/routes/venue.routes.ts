import { bookVenue, getVenues } from "@src/controllers/venue-controllers";
import { Router } from "express";

const router = Router();

router.get("/venues", getVenues);

router.post("/book", bookVenue);

export default router;
