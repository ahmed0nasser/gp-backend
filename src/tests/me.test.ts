// import { equal, ok } from "node:assert/strict";
// import { beforeEach, before, after, describe, it } from "node:test";
// import request from "supertest";
// import app from "../app/app";
// import User from "../app/models/user";
// import {
//   deleteUsersAndResetCounter,
//   loginUser,
//   registerUser,
//   testUser,
//   userId,
// } from "./utils/user";
// import { IRelation } from "../app/schemas/database/relation";

// describe("GET /me", () => {
//   before(deleteUsersAndResetCounter);
//   before(registerUser);
//   after(deleteUsersAndResetCounter);

//   it("fetches user info for authorized user", async () => {
//     const tokens = await loginUser();
//     await request(app)
//       .get("/me")
//       .auth(tokens.accessToken, { type: "bearer" })
//       .expect(200)
//       .expect({
//         status: "success",
//         data: {
//           id: userId,
//           role: testUser.role,
//           fullname: testUser.firstName + " " + testUser.lastName,
//           img: "",
//         },
//       });
//   });

//   it("does not fetch user info for unauthorized user (no token)", async () => {
//     await request(app).get("/me").expect(401);
//   });

//   it("does not fetch user info for unauthorized user (malformed token)", async () => {
//     await request(app)
//       .get("/me")
//       .auth("mybrandnewmalfo00rmedtoken", { type: "bearer" })
//       .expect(403);
//   });
// });

// describe("GET /me/relations", () => {
//   before(deleteUsersAndResetCounter);
//   before(registerUser);
//   after(deleteUsersAndResetCounter);

//   it("fetches user relations for authorized user", async () => {
//     const fakeRelations: IRelation[] = [
//       {
//         _id: 1,
//         relatedUserId: 1,
//         type: "incoming",
//       },
//       {
//         _id: 2,
//         relatedUserId: 1,
//         type: "outgoing",
//       },
//       {
//         _id: 3,
//         relatedUserId: 1,
//         type: "relation",
//       },
//     ];

//     const user = await User.findById(userId);
//     fakeRelations.forEach(
//       async (relation) => await user?.relations.push(relation)
//     );
//     await user?.save();

//     const tokens = await loginUser();
//     const res = await request(app)
//       .get("/me/relations")
//       .auth(tokens.accessToken, { type: "bearer" })
//       .expect(200);

//     for (let i = 0; i < fakeRelations.length; i++) {
//       const resRelation = res.body.data[i];

//       equal(resRelation._id, fakeRelations[i]._id);
//       equal(resRelation.relatedUserId, fakeRelations[i].relatedUserId);
//       equal(resRelation.type, fakeRelations[i].type);

//       resRelation.type === "outgoing"
//         ? ok(!resRelation.user)
//         : ok(resRelation.user);
//     }
//   });
// });
