import express from "express";
import { UserClaim } from "../../services/auth";

declare module "express" {
  interface Request {
    userClaim?: UserClaim;
  }
}
