import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { vitalStatsQuerySchema } from "../schemas/validation/vitalStats";
import { notificationSchema, notificationsQuerySchema } from "../schemas/validation/notifications";
import { idParamsSchema } from "../schemas/validation/common";
import {
  usersGetNotificationsController,
  usersGetUserProfileController,
  usersGetVitalStatsController,
  usersPostNotificationController,
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

router.post(
  "/:id/notifications",
  validateRequest("params", idParamsSchema),
  validateRequest("body", notificationSchema),
  usersPostNotificationController
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
