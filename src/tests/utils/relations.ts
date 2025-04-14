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
