import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { acceptFriendRequest, getFriendRequests, getMyfriends, getRecommendedUsers, outgoingFriendRequests, sendFriendRequest } from "../controllers/user.controller.js";

const router = express.Router();

//apply auth middlewares to all routes

router.use(protectRoute);

router.get("/",getRecommendedUsers);
router.get("/friends",getMyfriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", outgoingFriendRequests);

export default router;