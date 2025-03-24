import { Router } from "express";
import authUserHandler from "../middleware/authUserHandler";
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

router.get("/", meInfoController);

router.get("/relations", meRelationsController);

router.get("/profile", meProfileController);

router.get(
  "/notifications",
  validateRequest("query", notificationsQuerySchema),
  meNotificationsController
);

router.get(
  "/vital-stats",
  validateRequest("query", vitalStatsQuerySchema),
  meVitalStatsController
);

export default router;
