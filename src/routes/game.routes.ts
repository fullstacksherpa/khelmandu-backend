import {
  acceptRequest,
  createGame,
  gamePlayers,
  gameRequest,
  getGame,
  getRequests,
  getUpcoming,
  toggleMatchfull,
} from "@src/controllers/game-controller";
import { Router } from "express";

const router = Router();

router.post("/creategame", createGame);

router.get("/", getGame);

router.get("/upcoming", getUpcoming);

router.post("/:gameId/request", gameRequest);

router.get("/:gameId/requests", getRequests);

router.post("/accept", acceptRequest);

router.get("/:gameId/players", gamePlayers);

router.post("/toggle-match-full", toggleMatchfull);

export default router;
