import {
  acceptRequest,
  createGame,
  gamePlayers,
  gameRequest,
  getGame,
  getNearestGames,
  getRequests,
  getUpcoming,
  toggleMatchfull,
} from "@src/controllers/game-controller.js";
import { Router } from "express";
import { verifyJWT } from "@middlewares/verifyJWT.middleware.js";

const router = Router();

router.get("/", getGame);
router.get("/nearestGame", getNearestGames);
router.post("/creategame", verifyJWT, createGame);
router.get("/upcoming", getUpcoming);

router.post("/:gameId/request", verifyJWT, gameRequest);
router.get("/:gameId/requests", verifyJWT, getRequests);

router.post("/accept", verifyJWT, acceptRequest);
router.get("/:gameId/players", gamePlayers);

router.post("/toggle-match-full", verifyJWT, toggleMatchfull);
export default router;
