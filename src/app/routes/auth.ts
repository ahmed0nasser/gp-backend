import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import registerSchema from "../schemas/validation/auth/register";
import loginSchema from "../schemas/validation/auth/login";
import refreshSchema from "../schemas/validation/auth/refresh";
import registerController from "../controllers/auth/register";
import loginController from "../controllers/auth/login";
import refreshController from "../controllers/auth/refresh";
import logoutController from "../controllers/auth/logout";

const router = Router();

router.post(
  "/register",
  validateRequest("body", registerSchema),
  registerController
);

router.post("/login", validateRequest("body", loginSchema), loginController);

router.post(
  "/refresh",
  validateRequest("body", refreshSchema),
  refreshController
);

router.post("/logout", logoutController);

export default router;
