import { equal, ok } from "node:assert/strict";
import { beforeEach, before, after, describe, it } from "node:test";
import request from "supertest";
import app from "../app/app";
import User from "../app/models/user";
import {
  deleteUserAndResetCounter,
  testUser,
  registerUser,
  userId,
} from "./utils/user";

let body = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  repeatPassword: "",
  role: "",
} as any;

describe("POST /auth/register", () => {
  before(deleteUserAndResetCounter);
  beforeEach(() => {
    // Reset the body
    for (let key in testUser) {
      body[key] = testUser[key];
    }
  });

  it("registers new caregiver user with valid supplied data", async () => {
    const keys = ["firstName", "lastName", "email", "role"];

    await request(app).post("/auth/register").send(body).expect(201).expect({
      status: "success",
      message: "User registered successfully",
      data: { userId },
    });

    const user = (await User.findById(userId, keys)) as any;
    ok(user);

    for (let key of keys) {
      equal(user[key], body[key]);
    }

    await deleteUserAndResetCounter(); // Cleaning
  });

  it("registers new ward user with valid supplied data", async () => {
    const keys = ["firstName", "lastName", "email", "role"];

    body.role = "ward";

    await request(app).post("/auth/register").send(body).expect(201).expect({
      status: "success",
      message: "User registered successfully",
      data: { userId },
    });

    const user = (await User.findById(userId, keys)) as any;
    ok(user);

    for (let key of keys) {
      equal(user[key], body[key]);
    }

    await deleteUserAndResetCounter(); // Cleaning
  });

  it("does not register user with empty first name", async () => {
    body.firstName = "";

    await request(app).post("/auth/register").send(body).expect(400);
  });

  it("does not register user with empty last name", async () => {
    body.lastName = "";

    await request(app).post("/auth/register").send(body).expect(400);
  });

  it("does not register user with invalid email (without @)", async () => {
    body.email = "jhondoe11ii.com";

    await request(app).post("/auth/register").send(body).expect(400);
  });

  it("does not register user with invalid email (without .com)", async () => {
    body.email = "jhondoe11@iicom";

    await request(app).post("/auth/register").send(body).expect(400);
  });

  it("does not register user with invalid email (empty name)", async () => {
    body.email = "@ii.com";

    await request(app).post("/auth/register").send(body).expect(400);
  });

  it("does not register user with invalid email (empty domain)", async () => {
    body.email = "jhondoe11@.com";

    await request(app).post("/auth/register").send(body).expect(400);
  });

  it("does not register user with password less than 8 characters", async () => {
    body.password = "1234567";
    body.repeatPassword = "1234567";

    await request(app).post("/auth/register").send(body).expect(400);
  });

  it("does not register user with password and repeat password does not match", async () => {
    body.repeatPassword = "12345678910";

    await request(app).post("/auth/register").send(body).expect(400);
  });

  it('does not register user with role is not in ["caregiver" , "ward"] (capitalized)', async () => {
    body.role = "Caregiver";

    await request(app).post("/auth/register").send(body).expect(400);
  });

  it('does not register user with role is not in ["caregiver" , "ward"] (extra letters)', async () => {
    body.role = "caregivers";

    await request(app).post("/auth/register").send(body).expect(400);
  });

  it('does not register user with role is not in ["caregiver" , "ward"] (another role)', async () => {
    body.role = "doctor";

    await request(app).post("/auth/register").send(body).expect(400);
  });
});

describe("POST /auth/login", () => {
  before(deleteUserAndResetCounter);
  before(registerUser);
  after(deleteUserAndResetCounter);

  it("logins already registered user with valid login data", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "jhondoe11@ii.com", password: "123456789" })
      .expect(200);

    const user = await User.findById(userId);
    ok(user);

    equal(res.body.data.refreshToken, user.refreshToken);
  });

  it("does not login user with unmatched email", async () => {
    await request(app)
      .post("/auth/login")
      .send({ email: "zezoEldacklawey@ii.com", password: "123456789" })
      .expect(404);
  });

  it("does not login user with wrong password", async () => {
    await request(app)
      .post("/auth/login")
      .send({ email: "jhondoe11@ii.com", password: "12345678910" })
      .expect(401);
  });

  it("does not login user with invalid email", async () => {
    await request(app)
      .post("/auth/login")
      .send({ email: "jhondoe11ii.com", password: "123456789" })
      .expect(400);
  });

  it("does not login user with invalid password (less than 8 characters)", async () => {
    await request(app)
      .post("/auth/login")
      .send({ email: "jhondoe11@ii.com", password: "1234567" })
      .expect(400);
  });

  it("does not login user with unsupplied email field", async () => {
    await request(app)
      .post("/auth/login")
      .send({ password: "123456789" })
      .expect(400);
  });

  it("does not login user with unsupplied password field", async () => {
    await request(app)
      .post("/auth/login")
      .send({ email: "jhondoe11@ii.com" })
      .expect(400);
  });
});

describe("POST /auth/refresh", () => {
  before(deleteUserAndResetCounter);
  before(registerUser);
  after(deleteUserAndResetCounter);

  it("refreshes access token for already registered user", async () => {
    // Login First
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "jhondoe11@ii.com", password: "123456789" });

    const refreshToken = res.body.data.refreshToken;

    await request(app).post("/auth/refresh").send({ refreshToken }).expect(200);
  });

  it("does not refresh access token for unknown refresh token", async () => {
    // Login First
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "jhondoe11@ii.com", password: "123456789" });

    const refreshToken = res.body.data.refreshToken + "aslkclk;ajsd";

    await request(app).post("/auth/refresh").send({ refreshToken }).expect(404);
  });
});

describe("POST /auth/logout", () => {
  before(deleteUserAndResetCounter);
  before(registerUser);
  after(deleteUserAndResetCounter);

  it("logouts user already logged in", async () => {
    // Login First
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "jhondoe11@ii.com", password: "123456789" });

    await request(app)
      .post("/auth/logout")
      .auth(res.body.data.accessToken, { type: "bearer" })
      .expect(204);

    const user = await User.findById(userId);
    ok(user?.refreshToken === "");
  });

  it("does not logout user without providing authorization", async () => {
    await request(app).post("/auth/logout").expect(401);
  });

  it("does not logout user with malformed jwt", async () => {
    await request(app)
      .post("/auth/logout")
      .auth("thisismalformedjwt", { type: "bearer" })
      .expect(403);
  });
});
