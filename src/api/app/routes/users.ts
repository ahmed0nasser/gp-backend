import { Request, Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { vitalStatsQuerySchema } from "../schemas/validation/vitalStats";
import {
  notificationSchema,
  notificationsQuerySchema,
} from "../schemas/validation/notifications";
import { idParamsSchema } from "../schemas/validation/common";
import {
  usersGetUserInfoController,
  usersGetUserProfileController,
  usersGetVitalStatsController,
  usersPostNotificationController,
  usersPostRelationController,
} from "../controllers/users";
import UnableAuthenticateUserError from "../errors/UnableAuthenticateUserError";
import { areRelated } from "../services/relations";
import APIError from "../errors/APIError";
import { notificationsFetchController } from "../controllers/notifications";

const router = Router();

router.get(
  "/:id/info",
  validateRequest("params", idParamsSchema),
  usersGetUserInfoController
);

router.post(
  "/:id/relations",
  validateRequest("params", idParamsSchema),
  usersPostRelationController
);

router.get(
  "/:id/notifications",
  validateRequest("params", idParamsSchema),
  validateRequest("query", notificationsQuerySchema),
  async (req: Request, res, next) => {
    try {
      if (!req.userClaim) {
        throw new UnableAuthenticateUserError();
      }
      if (
        !(await areRelated(Number(req.userClaim.id), Number(req.params.id)))
      ) {
        throw new APIError(403, {
          message: "Cannot get notifications of unrelated user",
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  notificationsFetchController("user")
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
