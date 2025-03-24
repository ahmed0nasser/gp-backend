import { Router } from "express";
import authUserHandler from "../middleware/authUser";
import { validateRequest } from "../middleware/validateRequest";
import { idParamsSchema } from "../schemas/validation/common";
import { relationStatusSchema } from "../schemas/validation/relations";
import {
  relationDeleteController,
  relationFetchController,
  relationStatusController,
} from "../controllers/relations";

const router = Router();

router.get(
  "/:id",
  authUserHandler,
  validateRequest("params", idParamsSchema),
  relationFetchController
);

router.patch(
  "/:id",
  authUserHandler,
  validateRequest("params", idParamsSchema),
  validateRequest("body", relationStatusSchema),
  relationStatusController
);

router.delete(
  "/:id",
  authUserHandler,
  validateRequest("params", idParamsSchema),
  relationDeleteController
);

export default router;
