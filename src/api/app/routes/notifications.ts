import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { idParamsSchema } from "../schemas/validation/common";
import {
  multiNotificationsReadSchema,
  oneNotificaitonReadSchema,
} from "../schemas/validation/notifications";
import {
  notificationDeleteController,
  notificationFetchOneController,
  notificationReadOneController,
  notificationsReadController,
} from "../controllers/notifications";

const router = Router();

router.patch(
  "/",
  validateRequest("body", multiNotificationsReadSchema),
  notificationsReadController
);

router.patch(
  "/:id",
  validateRequest("params", idParamsSchema),
  validateRequest("body", oneNotificaitonReadSchema),
  notificationReadOneController
);

router.get(
  "/:id",
  validateRequest("params", idParamsSchema),
  notificationFetchOneController
);

router.delete(
  "/:id",
  validateRequest("params", idParamsSchema),
  notificationDeleteController
);

export default router;
