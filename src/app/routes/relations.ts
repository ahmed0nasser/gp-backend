import { Router } from "express";
import authUserHandler from "../middleware/authUser";
import { validateRequest } from "../middleware/validateRequest";
import { idParamsSchema } from "../schemas/validation/common";
import { relationStatusSchema } from "../schemas/validation/relations";
import {
  relationsDeleteController,
  relationsStatusController,
} from "../controllers/relations";

const router = Router();

router.get("/:id", authUserHandler, validateRequest("params", idParamsSchema));

router.patch(
  "/:id",
  authUserHandler,
  validateRequest("params", idParamsSchema),
  validateRequest("body", relationStatusSchema),
  relationsStatusController
);

router.delete(
  "/:id",
  authUserHandler,
  validateRequest("params", idParamsSchema),
  relationsDeleteController
);

export default router;
