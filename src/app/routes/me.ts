import { Router } from "express";
import authUserHandler from "../middleware/authUser";
import { validateRequest } from "../middleware/validateRequest";
import { notificationsQuerySchema } from "../schemas/validation/notifications";
import { vitalStatsQuerySchema } from "../schemas/validation/vitalStats";
import {
  meInfoController,
  meNotificationsController,
  meProfileController,
  meRelationsController,
  meVitalStatsController,
} from "../controllers/me";

const router = Router();

router.get("/", authUserHandler, meInfoController);

router.get("/relations", authUserHandler, meRelationsController);

router.get("/profile", authUserHandler, meProfileController);

router.get(
  "/notifications",
  authUserHandler,
  validateRequest("query", notificationsQuerySchema),
  meNotificationsController
);

router.get(
  "/vital-stats",
  authUserHandler,
  validateRequest("query", vitalStatsQuerySchema),
  meVitalStatsController
);

export default router;
