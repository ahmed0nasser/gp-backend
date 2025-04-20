import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { idParamsSchema } from "../schemas/validation/common";
import { notificationReadSchema } from "../schemas/validation/notifications";
import {
  notificationDeleteController,
  notificationFetchOneController,
  notificationsReadController,
} from "../controllers/notifications";

const router = Router();

router.patch(
  "/",
  validateRequest("body", notificationReadSchema),
  notificationsReadController
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
