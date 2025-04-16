import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { idParamsSchema } from "../schemas/validation/common";
import {
  notificationReadSchema,
  notificationsQuerySchema,
} from "../schemas/validation/notifications";
import {
  notificationDeleteController,
  notificationFetchOneController,
  notificationsFetchController,
  notificationsReadController,
} from "../controllers/notifications";

const router = Router();

router.get(
  "/notifications",
  validateRequest("query", notificationsQuerySchema),
  notificationsFetchController("me")
);

router.patch(
  "/",
  validateRequest("params", idParamsSchema),
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
