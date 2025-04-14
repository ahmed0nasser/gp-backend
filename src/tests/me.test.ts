import { equal, ok } from "node:assert/strict";
import { before, after, describe, it } from "node:test";
import request from "supertest";
import app from "../app/app";
import {
  deleteUsersAndResetCounters,
  loginUser,
  registerUser,
  testUser1,
  testUser2,
  testUser3,
} from "./utils/user";
import { relateUsers } from "./utils/relations";

describe("GET /me", () => {
  before(async () => await registerUser(testUser1));
  after(deleteUsersAndResetCounters);

  it("fetches same user info for authorized user", async () => {
    const tokens = await loginUser(testUser1);
    const res = await request(app)
      .get("/me")
      .auth(tokens.accessToken, { type: "bearer" })
      .expect(200);

    equal(res.body.status, "success");
    ok(res.body.data.id);
    equal(res.body.data.role, testUser1.role);
    equal(
      res.body.data.fullName,
      testUser1.firstName + " " + testUser1.lastName
    );
    equal(res.body.data.img, "");
  });

  it("does not fetch user info for unauthorized user (no token)", async () => {
    await request(app).get("/me").expect(401);
  });

  it("does not fetch user info for unauthorized user (malformed token)", async () => {
    await request(app)
      .get("/me")
      .auth("mybrandnewmalfo00rmedtoken", { type: "bearer" })
      .expect(403);
  });
});

describe("GET /me/relations", () => {
  before(async () => await registerUser(testUser1));
  before(async () => await registerUser(testUser2));
  after(deleteUsersAndResetCounters);

  it("fetches same user's relations for authorized user", async () => {
    const relationId = await relateUsers(testUser1, testUser2);
    const tokensUser1 = await loginUser(testUser1);
    const res = await request(app)
      .get("/me/relations")
      .auth(tokensUser1.accessToken, { type: "bearer" })
      .expect(200);

    equal(res.body.status, "success");
    equal(res.body.data.length, 1);

    const resRelation = res.body.data[0];
    equal(resRelation.id, relationId);
    equal(
      resRelation.user.fullName,
      testUser1.firstName + " " + testUser1.lastName
    );
    equal(resRelation.user.img, "");
  });
});

describe("GET /me/profile", () => {
  before(async () => await registerUser(testUser1));
  after(deleteUsersAndResetCounters);

  it("fetches same user profile for authorized user", async () => {
    const tokensUser1 = await loginUser(testUser1);
    const res = await request(app)
      .get("/me/profile")
      .auth(tokensUser1.accessToken, { type: "bearer" })
      .expect(200);

    equal(res.body.status, "success");

    const profile = res.body.data;
    equal(profile.id, tokensUser1.userId);
    equal(profile.email, testUser1.email);
    equal(profile.role, testUser1.role);
    equal(profile.firstName, testUser1.firstName);
    equal(profile.lastName, testUser1.lastName);
  });

  it("does not fetch same user profile without access token", async () => {
    await request(app).get("/me/profile").expect(401);
  });
});

describe("PATCH /me/profile", () => {
  before(async () => await registerUser(testUser1));
  before(async () => await registerUser(testUser3));
  after(deleteUsersAndResetCounters);

  it("modify same caregiver user profile", async () => {
    const tokensUser1 = await loginUser(testUser1);
    const profileChange = {
      title: "Dr",
      firstName: "Mohamed",
      lastName: "Mahmoud",
      phoneNumber: "03216547",
      organization: "Alex Hospital",
    };

    await request(app)
      .patch("/me/profile")
      .auth(tokensUser1.accessToken, { type: "bearer" })
      .send(profileChange)
      .expect(204);

    const res = await request(app)
      .get("/me/profile")
      .auth(tokensUser1.accessToken, { type: "bearer" });

    const profile = res.body.data;
    equal(profile.id, tokensUser1.userId);
    equal(profile.title, profileChange.title);
    equal(profile.firstName, profileChange.firstName);
    equal(profile.lastName, profileChange.lastName);
    equal(profile.phoneNumber, profileChange.phoneNumber);
    equal(profile.organization, profileChange.organization);
  });

  it("does not modify impairment field for same caregiver user's profile", async () => {
    const tokensUser1 = await loginUser(testUser1);
    const profileChange = {
      impairment: "Bipolar",
    };

    await request(app)
      .patch("/me/profile")
      .auth(tokensUser1.accessToken, { type: "bearer" })
      .send(profileChange)
      .expect(400);
  });

  it("does not modify title field for same ward user's profile", async () => {
    const tokensUser3 = await loginUser(testUser3);
    const profileChange = {
      title: "Nurse",
    };

    await request(app)
      .patch("/me/profile")
      .auth(tokensUser3.accessToken, { type: "bearer" })
      .send(profileChange)
      .expect(400);
  });

  it("does not modify organization field for same ward user's profile", async () => {
    const tokensUser3 = await loginUser(testUser3);
    const profileChange = {
      organization: "National Health Organization (NHO)",
    };

    await request(app)
      .patch("/me/profile")
      .auth(tokensUser3.accessToken, { type: "bearer" })
      .send(profileChange)
      .expect(400);
  });

  it("does not modify same user profile without access token", async () => {
    await request(app).patch("/me/profile").expect(401);
  });
});
