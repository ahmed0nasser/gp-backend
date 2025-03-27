import request from "supertest";
import app from "../../app/app";
import User from "../../app/models/user";
import { resetCounter } from "../../app/models/counter";
import { UserTokens } from "../../app/services/auth";

export const userId = 1;

export const testUser = {
  firstName: "Jhon",
  lastName: "Doe",
  email: "jhondoe11@ii.com",
  password: "123456789",
  repeatPassword: "123456789",
  role: "caregiver",
} as any;

export const registerUser = async () => {
  await request(app).post("/auth/register").send(testUser);
};

export const loginUser = async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "jhondoe11@ii.com", password: "123456789" });

  return res.body.data as UserTokens;
};

export const deleteUserAndResetCounter = async () => {
  await User.findByIdAndDelete(userId);
  await resetCounter("user");
};
