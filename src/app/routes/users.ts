import { Router } from "express";
import authUserHandler from "../middleware/authUser";
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
  authUserHandler,
  validateRequest("params", idParamsSchema),
  validateRequest("query", notificationsQuerySchema),
  usersPostRelationController
);

router.get(
  "/:id/notifications",
  authUserHandler,
  validateRequest("params", idParamsSchema),
  validateRequest("query", notificationsQuerySchema),
  usersGetNotificationsController
);

router.get(
  "/:id/vital-stats",
  authUserHandler,
  validateRequest("params", idParamsSchema),
  validateRequest("query", vitalStatsQuerySchema),
  usersGetVitalStatsController
);

export default router;
