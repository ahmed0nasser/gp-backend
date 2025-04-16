import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import {
  notificationReadSchema,
  notificationsQuerySchema,
} from "../schemas/validation/notifications";
import { vitalStatsQuerySchema } from "../schemas/validation/vitalStats";
import {
  meChangeProfileController,
  meDeleteNotificationController,
  meInfoController,
  meNotificationsController,
  mePairDeviceController,
  meProfileController,
  meReadNotificationsController,
  meRelationsController,
  meUnpairDeviceController,
  meVitalStatsController,
} from "../controllers/me";
import { profileChangeSchema } from "../schemas/validation/profile";
import { idParamsSchema } from "../schemas/validation/common";
import { devicePairSchema } from "../schemas/validation/devices";

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

router.patch(
  "/notifications",
  validateRequest("body", notificationReadSchema),
  meReadNotificationsController
);

router.delete(
  "/notifications/:id",
  validateRequest("params", idParamsSchema),
  meDeleteNotificationController
);

router.get(
  "/vital-stats",
  validateRequest("query", vitalStatsQuerySchema),
  meVitalStatsController
);

router.post(
  "/devices",
  validateRequest("body", devicePairSchema),
  mePairDeviceController
);

router.delete(
  "/devices",
  meUnpairDeviceController
);

export default router;
