import request from "supertest";
import app from "../../app/app";
import { NewUser } from "../../app/services/auth";
import { loginUser } from "./user";

// BOTH user1 and user2 MUST BE ALREADY REGISTERED
export const relateUsers = async (
  user1: NewUser,
  user2: NewUser
): Promise<number> => {
  // Get access tokens for two users
  const tokensUser1 = await loginUser(user1);
  const tokensUser2 = await loginUser(user2);
  // Send relation request from user1 to user2
  const {
    body: {
      data: { relationId },
    },
  } = await request(app)
    .post(`/users/${tokensUser2.userId}/relations`)
    .auth(tokensUser1.accessToken, { type: "bearer" });
  // Accept relation request
  await request(app)
    .patch("/relations/" + relationId)
    .auth(tokensUser2.accessToken, { type: "bearer" })
    .send({ status: "accepted" });

  return relationId;
};

// BOTH user1 and user2 MUST BE ALREADY REGISTERED
export const unrelateUsers = async (user1: NewUser, user2: NewUser) => {
  // Get access tokens for two users
  const tokensUser1 = await loginUser(user1);
  const tokensUser2 = await loginUser(user2);
  // Get user1's relations
  const {
    body: { data: relations },
  } = await request(app)
    .get(`/me/relations`)
    .auth(tokensUser1.accessToken, { type: "bearer" });
  // Find relationId between user1 and user2
  const relationFound = relations.find(
    (relation: { user: { id: number } }) =>
      relation.user.id === tokensUser2.userId
  );
  if (!relationFound)
    throw new Error(
      `Users already unrelated:\n ${{ id: tokensUser1.userId, ...user1 }}\n${{
        id: tokensUser2.userId,
        ...user2,
      }}`
    );
  // Delete relation
  await request(app)
    .delete("/relations/" + relationFound.id)
    .auth(tokensUser1.accessToken, { type: "bearer" });
};
