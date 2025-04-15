import { equal, ok } from "node:assert";
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

describe("/users/{userId} tests", () => {
  before(async () => await registerUser(testUser1));
  before(async () => await registerUser(testUser2));
  before(async () => await registerUser(testUser3));
  before(async () => await relateUsers(testUser1, testUser2));
  after(deleteUsersAndResetCounters);

  describe("GET /users/{userId}/profile", () => {
    it("fetches profile of caller's related user whose id={userId}", async () => {
      const tokensUser1 = await loginUser(testUser1);
      const tokensUser2 = await loginUser(testUser2);
      const {
        body: { data: profileUser2 },
      } = await request(app)
        .get(`/users/${tokensUser2.userId}/profile`)
        .auth(tokensUser1.accessToken, { type: "bearer" })
        .expect(200);

      equal(profileUser2.id, tokensUser2.userId);
      equal(profileUser2.firstName, testUser2.firstName);
      equal(profileUser2.lastName, testUser2.lastName);
      equal(profileUser2.email, testUser2.email);
      equal(profileUser2.role, testUser2.role);
    });

    it("does not fetch profile of unrelated user to the caller", async () => {
      const tokensUser1 = await loginUser(testUser1);
      const tokensUser3 = await loginUser(testUser3);
      await request(app)
        .get(`/users/${tokensUser3.userId}/profile`)
        .auth(tokensUser1.accessToken, { type: "bearer" })
        .expect(403);
    });
  });

  describe("POST /users/{userId}/relations", () => {
    it("sends relation request to unrelated user and it is rejected", async () => {
      const tokensUser1 = await loginUser(testUser1);
      const tokensUser3 = await loginUser(testUser3);

      // Send relation request from user1 to user3 who are unrelated
      const {
        body: {
          data: { relationId },
        },
      } = await request(app)
        .post(`/users/${tokensUser3.userId}/relations`)
        .auth(tokensUser1.accessToken, { type: "bearer" })
        .expect(201);

      // Fetch each user's relations
      const {
        body: { data: relationsUser1 },
      } = await request(app)
        .get("/me/relations")
        .auth(tokensUser1.accessToken, { type: "bearer" });
      const {
        body: { data: relationsUser3 },
      } = await request(app)
        .get("/me/relations")
        .auth(tokensUser3.accessToken, { type: "bearer" });

      // Assert relations' length
      equal(relationsUser1.length, 2);
      equal(relationsUser3.length, 1);
      // Assert same relation
      equal(relationsUser1[1].id, relationId);
      equal(relationsUser3[0].id, relationId);
      // Assert same user
      equal(relationsUser1[1].user.id, tokensUser3.userId);
      equal(relationsUser3[0].user.id, tokensUser1.userId);
      // Assert relation types to sender and receiver
      equal(relationsUser1[1].type, "outgoing");
      equal(relationsUser3[0].type, "incoming");
      // Assert sender does not have receiver info
      ok(!relationsUser1[1].user.fullName);
      ok(!relationsUser1[1].user.role);
      ok(!relationsUser1[1].user.img);
      // Assert receiver does have sender info
      equal(
        relationsUser3[0].user.fullName,
        testUser1.firstName + " " + testUser1.lastName
      );
      equal(relationsUser3[0].user.role, testUser1.role);

      // Reject relation request
      await request(app)
        .patch("/relations/" + relationId)
        .send({ status: "rejected" })
        .auth(tokensUser3.accessToken, { type: "bearer" });

      // Check relations once again
      const {
        body: { data: rejectedRelationsUser1 },
      } = await request(app)
        .get("/me/relations")
        .auth(tokensUser1.accessToken, { type: "bearer" });
      const {
        body: { data: rejectedRelationsUser3 },
      } = await request(app)
        .get("/me/relations")
        .auth(tokensUser3.accessToken, { type: "bearer" });

      // Assert relations' length for both users
      equal(rejectedRelationsUser1.length, 1);
      equal(rejectedRelationsUser3.length, 0);
    });

    it("sends relation request to unrelated user and it is accepted", async () => {
      const tokensUser1 = await loginUser(testUser1);
      const tokensUser3 = await loginUser(testUser3);

      // Send relation request from user1 to user3 who are unrelated
      const {
        body: {
          data: { relationId },
        },
      } = await request(app)
        .post(`/users/${tokensUser3.userId}/relations`)
        .auth(tokensUser1.accessToken, { type: "bearer" })
        .expect(201);

      // Fetch each user's relations
      const {
        body: { data: relationsUser1 },
      } = await request(app)
        .get("/me/relations")
        .auth(tokensUser1.accessToken, { type: "bearer" });
      const {
        body: { data: relationsUser3 },
      } = await request(app)
        .get("/me/relations")
        .auth(tokensUser3.accessToken, { type: "bearer" });

      // Assert relations' length
      equal(relationsUser1.length, 2);
      equal(relationsUser3.length, 1);
      // Assert same relation
      equal(relationsUser1[1].id, relationId);
      equal(relationsUser3[0].id, relationId);
      // Assert same user
      equal(relationsUser1[1].user.id, tokensUser3.userId);
      equal(relationsUser3[0].user.id, tokensUser1.userId);
      // Assert relation types to sender and receiver
      equal(relationsUser1[1].type, "outgoing");
      equal(relationsUser3[0].type, "incoming");
      // Assert sender does not have receiver info
      ok(!relationsUser1[1].user.fullName);
      ok(!relationsUser1[1].user.role);
      ok(!relationsUser1[1].user.img);
      // Assert receiver does have sender info
      equal(
        relationsUser3[0].user.fullName,
        testUser1.firstName + " " + testUser1.lastName
      );
      equal(relationsUser3[0].user.role, testUser1.role);

      // Accept relation request
      await request(app)
        .patch("/relations/" + relationId)
        .send({ status: "accepted" })
        .auth(tokensUser3.accessToken, { type: "bearer" });

      // Check relations once again
      const {
        body: { data: acceptedRelationsUser1 },
      } = await request(app)
        .get("/me/relations")
        .auth(tokensUser1.accessToken, { type: "bearer" });
      const {
        body: { data: acceptedRelationsUser3 },
      } = await request(app)
        .get("/me/relations")
        .auth(tokensUser3.accessToken, { type: "bearer" });

      // Assert relations' length
      equal(acceptedRelationsUser1.length, 2);
      equal(acceptedRelationsUser3.length, 1);
      // Assert same relation
      equal(acceptedRelationsUser1[1].id, relationId);
      equal(acceptedRelationsUser3[0].id, relationId);
      // Assert relation types to sender and receiver
      equal(acceptedRelationsUser3[0].type, "relation");
      equal(acceptedRelationsUser1[1].type, "relation");
      // Assert sender does have receiver info now
      equal(
        acceptedRelationsUser1[1].user.fullName,
        testUser3.firstName + " " + testUser3.lastName
      );
      equal(acceptedRelationsUser1[1].user.role, testUser3.role);

      // Finally delete the relation
      await request(app)
        .delete("/relations/" + relationId)
        .auth(tokensUser1.accessToken, { type: "bearer" });

      // Check relations once again
      const {
        body: { data: deletedRelationsUser1 },
      } = await request(app)
        .get("/me/relations")
        .auth(tokensUser1.accessToken, { type: "bearer" });
      const {
        body: { data: deletedRelationsUser3 },
      } = await request(app)
        .get("/me/relations")
        .auth(tokensUser3.accessToken, { type: "bearer" });

      // Assert relations' length
      equal(deletedRelationsUser1.length, 1);
      equal(deletedRelationsUser3.length, 0);
    });

    it("does not send relation request to already related user", async () => {
      const tokensUser1 = await loginUser(testUser1);
      const tokensUser2 = await loginUser(testUser2);

      const res = await request(app)
        .post(`/users/${tokensUser2.userId}/relations`)
        .auth(tokensUser1.accessToken, { type: "bearer" })
        .expect(403);

      equal(res.body.status, "error");
      equal(res.body.error.message, "Relation already exists");
    });

    it("does not send relation request to callers themselves", async () => {
      const tokensUser1 = await loginUser(testUser1);

      const res = await request(app)
        .post(`/users/${tokensUser1.userId}/relations`)
        .auth(tokensUser1.accessToken, { type: "bearer" })
        .expect(403);

      equal(res.body.status, "error");
      equal(res.body.error.message, "Cannot send relation request to yourself");
    });
  });
});
