import { Router } from "express";
import authUserHandler from "../middleware/authUser";
import { validateRequest } from "../middleware/validateRequest";
import { notificationsQuerySchema } from "../schemas/validation/notifications";
import { vitalStatsQuerySchema } from "../schemas/validation/vitalStats";
import {
  userInfoController,
  userNotificationsController,
  userProfileController,
  userRelationsController,
  userVitalStatsController,
} from "../controllers/me";

const router = Router();

router.get("/", authUserHandler, userInfoController);

router.get("/relations", authUserHandler, userRelationsController);

router.get("/profile", authUserHandler, userProfileController);

router.get(
  "/notifications",
  authUserHandler,
  validateRequest("query", notificationsQuerySchema),
  userNotificationsController
);

router.get(
  "/vital-stats",
  authUserHandler,
  validateRequest("query", vitalStatsQuerySchema),
  userVitalStatsController
);

export default router;
