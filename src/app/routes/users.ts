import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { vitalStatsQuerySchema } from "../schemas/validation/vitalStats";
import { notificationsQuerySchema } from "../schemas/validation/notifications";
import { idParamsSchema } from "../schemas/validation/common";
import {
  usersGetNotificationsController,
  usersGetUserProfileController,
  usersGetVitalStatsController,
  usersPostRelationController,
} from "../controllers/users";

const router = Router();

router.post(
  "/:id/relations",
  validateRequest("params", idParamsSchema),
  usersPostRelationController
);

router.get(
  "/:id/notifications",
  validateRequest("params", idParamsSchema),
  validateRequest("query", notificationsQuerySchema),
  usersGetNotificationsController
);

router.get(
  "/:id/profile",
  validateRequest("params", idParamsSchema),
  usersGetUserProfileController
);

router.get(
  "/:id/vital-stats",
  validateRequest("params", idParamsSchema),
  validateRequest("query", vitalStatsQuerySchema),
  usersGetVitalStatsController
);

export default router;
