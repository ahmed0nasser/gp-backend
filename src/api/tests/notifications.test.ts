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
import { relateUsers, unrelateUsers } from "./utils/relations";
import { assertTestingEnv } from "./utils/common";
import { NewNotification } from "../app/services/notifications";
import { deleteNotification, getNotifications } from "./utils/notifications";

assertTestingEnv();

describe("notifications end-points", () => {
  before(async () => await registerUser(testUser1));
  before(async () => await registerUser(testUser2));
  before(async () => await registerUser(testUser3));
  before(async () => await relateUsers(testUser1, testUser2));
  before(async () => await relateUsers(testUser1, testUser3));
  after(deleteUsersAndResetCounters);

  describe("GET /users/{userId}/notifications", () => {
    it("fetches notifications of a related user", async () => {
      const tokensUser1 = await loginUser(testUser1);
      const tokensUser2 = await loginUser(testUser2);
      // Get user2's notifications from user1
      const {
        body: {
          data: { notifications: notifications1 },
        },
      } = await request(app)
        .get(`/users/${tokensUser2.userId}/notifications?page=1&size=50`)
        .auth(tokensUser1.accessToken, { type: "bearer" })
        .expect(200);
      equal(notifications1.length, 0);

      // Construct notification
      const notification: NewNotification = {
        type: "normal",
        title: "notification for user2",
        body: "notification's entire body",
        relatedUserId: tokensUser2.userId,
      };
      // Send 3 notifications to user2
      const notificationsNum = 3;
      for (let i = 0; i < notificationsNum; i++) {
        await request(app)
          .post(`/users/${tokensUser2.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification);
      }
      // Get user2's notifications from user1
      const {
        body: {
          data: { notifications: notifications2 },
        },
      } = await request(app)
        .get(`/users/${tokensUser2.userId}/notifications?page=1&size=50`)
        .auth(tokensUser1.accessToken, { type: "bearer" })
        .expect(200);
      equal(notifications2.length, notificationsNum);
    });

    it("does not fetch notifications of unrelated user", async () => {
      const tokensUser2 = await loginUser(testUser2);
      const tokensUser3 = await loginUser(testUser3);

      await request(app)
        .get(`/users/${tokensUser3.userId}/notifications?page=1&size=50`)
        .auth(tokensUser2.accessToken, { type: "bearer" })
        .expect(403);
    });
  });

  describe("PATCH /notifications", () => {
    it("marks user's notifications as read", async () => {
      const tokensUser1 = await loginUser(testUser1);
      const tokensUser2 = await loginUser(testUser2);
      // Construct notification
      const notification: NewNotification = {
        type: "normal",
        title: "notification for user2",
        body: "notification's entire body",
        relatedUserId: tokensUser2.userId,
      };
      // Send 3 notifications to user2
      const ids: number[] = [];
      for (let i = 0; i < 3; i++) {
        const {
          body: {
            data: { notificationId },
          },
        } = await request(app)
          .post(`/users/${tokensUser2.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification);

        ids.push(notificationId);
      }
      const notificationsUser2 = await getNotifications(
        tokensUser2.accessToken
      );
      ok(
        notificationsUser2.every(
          (notification: { isRead: boolean }) => !notification.isRead
        )
      );
      // Mark them as read
      await request(app)
        .patch(`/notifications`)
        .auth(tokensUser2.accessToken, { type: "bearer" })
        .send({ isRead: true, ids })
        .expect(204);
      const readNotificationsUser2 = await getNotifications(
        tokensUser2.accessToken
      );
      ok(
        readNotificationsUser2.every(
          (notification: { isRead: boolean }) => notification.isRead
        )
      );
    });

    it("does not accept read request without isRead=true field", async () => {
      const tokensUser1 = await loginUser(testUser1);
      const tokensUser2 = await loginUser(testUser2);
      // Construct notification
      const notification: NewNotification = {
        type: "normal",
        title: "notification for user2",
        body: "notification's entire body",
        relatedUserId: tokensUser2.userId,
      };

      // Send 1 notification to user2
      const ids: number[] = [];
      for (let i = 0; i < 1; i++) {
        const {
          body: {
            data: { notificationId },
          },
        } = await request(app)
          .post(`/users/${tokensUser2.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification);

        ids.push(notificationId);
      }
      // isRead=false
      await request(app)
        .patch(`/notifications`)
        .auth(tokensUser2.accessToken, { type: "bearer" })
        .send({ isRead: false, ids })
        .expect(400);
      // Missing isRead field
      await request(app)
        .patch(`/notifications`)
        .auth(tokensUser2.accessToken, { type: "bearer" })
        .send({ ids })
        .expect(400);
    });

    it("does not accept read request if there is unknown notification id", async () => {
      const tokensUser1 = await loginUser(testUser1);
      const tokensUser2 = await loginUser(testUser2);
      // Construct notification
      const notification: NewNotification = {
        type: "normal",
        title: "notification for user2",
        body: "notification's entire body",
        relatedUserId: tokensUser2.userId,
      };

      // Send 1 notification to user2
      const ids: number[] = [];
      for (let i = 0; i < 1; i++) {
        const {
          body: {
            data: { notificationId },
          },
        } = await request(app)
          .post(`/users/${tokensUser2.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification);

        ids.push(notificationId);
      }
      // Add unknown id
      ids.push(123456789);
      // Send read request
      await request(app)
        .patch(`/notifications`)
        .auth(tokensUser2.accessToken, { type: "bearer" })
        .send({ isRead: true, ids })
        .expect(404);
    });
  });

  describe("POST /users/{userId}/notifications", () => {
    describe("sending notifications among 3 related users", () => {
      before(async () => await relateUsers(testUser2, testUser3));
      after(async () => await unrelateUsers(testUser2, testUser3));

      it("sends notification to oneself about a related user", async () => {
        const tokensUser1 = await loginUser(testUser1);
        const tokensUser2 = await loginUser(testUser2);

        // Check notificaitons
        const notificationsUser1 = await getNotifications(
          tokensUser1.accessToken
        );
        // Assert notifications length
        equal(notificationsUser1.length, 0);

        // Construct notification
        const notification: NewNotification = {
          type: "normal",
          title: "notification for user1",
          body: "notification's entire body",
          relatedUserId: tokensUser2.userId,
        };
        // send notification from user1 to user1
        const {
          body: {
            data: { notificationId },
          },
        } = await request(app)
          .post(`/users/${tokensUser1.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification)
          .expect(201);
        // Check notificaitons again
        const newNotificationsUser1 = await getNotifications(
          tokensUser1.accessToken
        );
        // Assert notifications length
        equal(newNotificationsUser1.length, 1);
        equal(newNotificationsUser1[0].id, notificationId);
        Object.keys(notification).forEach((key) => {
          equal(newNotificationsUser1[0][key], (notification as any)[key]);
        });

        await deleteNotification(tokensUser1.accessToken, notificationId);
        const deletedNotificationsUser1 = await getNotifications(
          tokensUser1.accessToken
        );
        // Assert notifications length
        equal(deletedNotificationsUser1.length, 0);
      });

      it("sends notification to oneself about oneself", async () => {
        const tokensUser1 = await loginUser(testUser1);

        const notificationsUser1 = await getNotifications(
          tokensUser1.accessToken
        );
        // Assert notifications length
        equal(notificationsUser1.length, 0);

        // Construct notification
        const notification: NewNotification = {
          type: "normal",
          title: "notification for user1",
          body: "notification's entire body",
          relatedUserId: tokensUser1.userId,
        };
        // send notification from user1 to user1
        const {
          body: {
            data: { notificationId },
          },
        } = await request(app)
          .post(`/users/${tokensUser1.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification)
          .expect(201);
        const newNotificationsUser1 = await getNotifications(
          tokensUser1.accessToken
        );
        // Assert notifications length
        equal(newNotificationsUser1.length, 1);
        equal(newNotificationsUser1[0].id, notificationId);
        Object.keys(notification).forEach((key) => {
          equal(newNotificationsUser1[0][key], (notification as any)[key]);
        });

        await deleteNotification(tokensUser1.accessToken, notificationId);
        const deletedNotificationsUser1 = await getNotifications(
          tokensUser1.accessToken
        );
        // Assert notifications length
        equal(deletedNotificationsUser1.length, 0);
      });

      it("sends notification to a related user about theirselves", async () => {
        const tokensUser1 = await loginUser(testUser1);
        const tokensUser2 = await loginUser(testUser2);

        const notificationsUser2 = await getNotifications(
          tokensUser2.accessToken
        );
        // Assert notifications length
        equal(notificationsUser2.length, 0);

        // Construct notification
        const notification: NewNotification = {
          type: "normal",
          title: "notification for user2",
          body: "notification's entire body",
          relatedUserId: tokensUser2.userId,
        };
        // send notification from user1 to user2
        const {
          body: {
            data: { notificationId },
          },
        } = await request(app)
          .post(`/users/${tokensUser2.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification)
          .expect(201);
        // Check notificaitons again
        const newNotificationsUser2 = await getNotifications(
          tokensUser2.accessToken
        );
        // Assert notifications length
        equal(newNotificationsUser2.length, 1);
        equal(newNotificationsUser2[0].id, notificationId);
        Object.keys(notification).forEach((key) => {
          equal(newNotificationsUser2[0][key], (notification as any)[key]);
        });

        await deleteNotification(tokensUser2.accessToken, notificationId);
        // Check notificaitons again
        const deletedNotificationsUser2 = await getNotifications(
          tokensUser2.accessToken
        );
        // Assert notifications length
        equal(deletedNotificationsUser2.length, 0);
      });

      it("sends notification to a related user about another related user shared between both sender and receiver", async () => {
        const tokensUser1 = await loginUser(testUser1);
        const tokensUser2 = await loginUser(testUser2);
        const tokensUser3 = await loginUser(testUser3);

        // Check notificaitons
        const notificationsUser2 = await getNotifications(
          tokensUser2.accessToken
        );
        // Assert notifications length
        equal(notificationsUser2.length, 0);

        // Construct notification
        const notification: NewNotification = {
          type: "normal",
          title: "notification for user2 about user3",
          body: "notification's entire body",
          relatedUserId: tokensUser3.userId,
        };
        // send notification from user1 to user2
        const {
          body: {
            data: { notificationId },
          },
        } = await request(app)
          .post(`/users/${tokensUser2.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification)
          .expect(201);
        const newNotificationsUser2 = await getNotifications(
          tokensUser2.accessToken
        );
        // Assert notifications length
        equal(newNotificationsUser2.length, 1);
        equal(newNotificationsUser2[0].id, notificationId);
        Object.keys(notification).forEach((key) => {
          equal(newNotificationsUser2[0][key], (notification as any)[key]);
        });

        await deleteNotification(tokensUser2.accessToken, notificationId);
        // Check notificaitons again
        const deletedNotificationsUser2 = await getNotifications(
          tokensUser2.accessToken
        );
        // Assert notifications length
        equal(deletedNotificationsUser2.length, 0);
      });
    });

    describe("sending notifications among 3 users where some of them are not related", () => {
      it("does not send notification to a related user about another unrelated user to receiver", async () => {
        const tokensUser1 = await loginUser(testUser1);
        const tokensUser2 = await loginUser(testUser2);
        const tokensUser3 = await loginUser(testUser3);

        // Check notificaitons
        const notificationsUser2 = await getNotifications(
          tokensUser1.accessToken
        );
        // Assert notifications length
        equal(notificationsUser2.length, 0);

        // Construct notification
        const notification: NewNotification = {
          type: "normal",
          title: "notification for user2 about user3",
          body: "notification's entire body",
          relatedUserId: tokensUser3.userId,
        };
        // send notification from user1 to user2
        await request(app)
          .post(`/users/${tokensUser2.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification)
          .expect(403);
      });

      it("does not send notification to a unrelated user", async () => {
        const tokensUser2 = await loginUser(testUser2);
        const tokensUser3 = await loginUser(testUser3);

        // Construct notification
        const notification: NewNotification = {
          type: "normal",
          title: "notification for user2",
          body: "notification's entire body",
          relatedUserId: tokensUser2.userId,
        };
        // send notification from user1 to user2
        await request(app)
          .post(`/users/${tokensUser3.userId}/notifications`)
          .auth(tokensUser2.accessToken, { type: "bearer" })
          .send(notification)
          .expect(403);
      });
    });

    describe("malformed notification requests", () => {
      it("does not send notification with missing type field", async () => {
        const tokensUser1 = await loginUser(testUser1);
        const tokensUser2 = await loginUser(testUser2);
        // Construct notification
        const notification = {
          type: "",
          title: "notification for user2",
          body: "notification's entire body",
          relatedUserId: tokensUser2.userId,
        };
        // send notification from user1 to user2
        await request(app)
          .post(`/users/${tokensUser2.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification)
          .expect(400);
      });

      it("does not send notification with missing title field", async () => {
        const tokensUser1 = await loginUser(testUser1);
        const tokensUser2 = await loginUser(testUser2);
        // Construct notification
        const notification = {
          type: "normal",
          title: "",
          body: "notification's entire body",
          relatedUserId: tokensUser2.userId,
        };
        // send notification from user1 to user2
        await request(app)
          .post(`/users/${tokensUser2.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification)
          .expect(400);
      });

      it("does not send notification with missing body field", async () => {
        const tokensUser1 = await loginUser(testUser1);
        const tokensUser2 = await loginUser(testUser2);
        // Construct notification
        const notification = {
          type: "normal",
          title: "notification for user2",
          body: "",
          relatedUserId: tokensUser2.userId,
        };
        // send notification from user1 to user2
        await request(app)
          .post(`/users/${tokensUser2.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification)
          .expect(400);
      });

      it("does not send notification with missing relatedUserId field", async () => {
        const tokensUser1 = await loginUser(testUser1);
        const tokensUser2 = await loginUser(testUser2);
        // Construct notification
        const notification = {
          type: "normal",
          title: "notification for user2",
          body: "notification's entire body",
        };
        // send notification from user1 to user2
        await request(app)
          .post(`/users/${tokensUser2.userId}/notifications`)
          .auth(tokensUser1.accessToken, { type: "bearer" })
          .send(notification)
          .expect(400);
      });
    });
  });
});
