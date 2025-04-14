import request from "supertest";
import app from "../../app/app";
import User from "../../app/models/user";
import { resetCounters } from "../../app/models/counter";
import { NewUser, UserTokens } from "../../app/services/auth";

export const testUser1: NewUser = {
  firstName: "Jhon",
  lastName: "Doe",
  email: "caregiver_jhondoe1@ii.com",
  password: "123456789",
  repeatPassword: "123456789",
  role: "caregiver",
};

export const testUser2: NewUser = {
  firstName: "Jhon",
  lastName: "Doe",
  email: "caregiver_jhondoe2@ii.com",
  password: "123456789",
  repeatPassword: "123456789",
  role: "caregiver",
};

export const testUser3: NewUser = {
  firstName: "Jhon",
  lastName: "Doe",
  email: "ward_jhondoe3@ii.com",
  password: "123456789",
  repeatPassword: "123456789",
  role: "ward",
};

export const registerUser = async (user: NewUser) => {
  await request(app).post("/auth/register").send(user);
};

// user MUST BE ALREADY REGISTERED
export const loginUser = async ({
  email,
  password,
}: NewUser): Promise<UserTokens> => {
  const res = await request(app).post("/auth/login").send({ email, password });
  
  return res.body.data;
};

export const deleteUsersAndResetCounters = async () => {
  await User.deleteMany({});
  await resetCounters();
};
