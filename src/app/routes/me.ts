import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { vitalStatsQuerySchema } from "../schemas/validation/vitalStats";
import {
  meChangeProfileController,
  meInfoController,
  mePairDeviceController,
  meProfileController,
  meRelationsController,
  meUnpairDeviceController,
  meVitalStatsController,
} from "../controllers/me";
import { profileChangeSchema } from "../schemas/validation/profile";
import { devicePairSchema } from "../schemas/validation/devices";
import { notificationsQuerySchema } from "../schemas/validation/notifications";
import { notificationsFetchController } from "../controllers/notifications";

const router = Router();

router.get("/", meInfoController);

router.get("/relations", meRelationsController);

router.get("/profile", meProfileController);

router.get(
  "/notifications",
  validateRequest("query", notificationsQuerySchema),
  notificationsFetchController("me")
);

router.patch(
  "/profile",
  validateRequest("body", profileChangeSchema),
  meChangeProfileController
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
