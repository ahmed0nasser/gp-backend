import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { notificationsQuerySchema } from "../schemas/validation/notifications";
import { vitalStatsQuerySchema } from "../schemas/validation/vitalStats";
import {
  meChangeProfileController,
  meInfoController,
  meNotificationsController,
  meProfileController,
  meRelationsController,
  meVitalStatsController,
} from "../controllers/me";
import { profileChangeSchema } from "../schemas/validation/profile";

const router = Router();

router.get("/", meInfoController);

router.get("/relations", meRelationsController);

router.get("/profile", meProfileController);

router.patch(
  "/profile",
  validateRequest("body", profileChangeSchema),
  meChangeProfileController
);

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
