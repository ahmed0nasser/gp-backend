import { Router } from "express";
import authUserHandler from "../middleware/authUserHandler";
import { validateRequest } from "../middleware/validateRequest";
import { vitalStatsQuerySchema } from "../schemas/validation/vitalStats";
import { notificationsQuerySchema } from "../schemas/validation/notifications";
import { idParamsSchema } from "../schemas/validation/common";
import {
  usersGetNotificationsController,
  usersGetVitalStatsController,
  usersPostRelationController,
} from "../controllers/users";

const router = Router();

router.post(
  "/:id/relations",
  validateRequest("params", idParamsSchema),
  validateRequest("query", notificationsQuerySchema),
  usersPostRelationController
);

router.get(
  "/:id/notifications",
  validateRequest("params", idParamsSchema),
  validateRequest("query", notificationsQuerySchema),
  usersGetNotificationsController
);

router.get(
  "/:id/vital-stats",
  validateRequest("params", idParamsSchema),
  validateRequest("query", vitalStatsQuerySchema),
  usersGetVitalStatsController
);

export default router;
