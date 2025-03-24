import APIError from "../errors/APIError";
import RelationDoesNotExistError from "../errors/RelationDoesNotExistError";
import UserDoesNotExistError from "../errors/UserDoesNotExistError";
import { getNextSequence } from "../models/counter";
import User from "../models/user";
import { IRelation, RelationType } from "../schemas/database/relation";
import { IUser } from "../schemas/database/user";
import { getUserInfoById, UserInfo } from "./users";

export interface UserRelation {
  id: number;
  type: RelationType;
  user?: UserInfo;
}

export type RelationStatus = "accepted" | "rejected" | "canceled";

export const getRelationsByUserId = async (
  userId: number
): Promise<UserRelation[]> => {
  const user = await User.findById(userId, "relations");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  const userRelations = await Promise.all(
    user.relations.map(async (relation) => {
      const userRelation: UserRelation = {
        id: relation._id,
        type: relation.type,
      };
      if (relation.type !== "outgoing")
        userRelation.user = await getUserInfoById(relation.relatedUserId);

      return userRelation;
    })
  );

  return userRelations;
};

export const getRelation = async (
  userId: number,
  relationId: number
): Promise<IRelation> => {
  const user = await User.findById(userId, "relations");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  const relation = user.relations.find(
    (relation) => relation._id === relationId
  );
  if (!relation) {
    throw new RelationDoesNotExistError(userId, relationId);
  }

  return relation;
};

export const sendRelationRequest = async (
  senderId: number,
  receiverId: number
): Promise<number> => {
  const sender = await User.findById(senderId, "_id relations");
  if (!sender) {
    throw new UserDoesNotExistError(senderId);
  }

  if (
    sender.relations.some((relation) => relation.relatedUserId === receiverId)
  ) {
    throw new APIError(403, { message: "Relation already exists" });
  }

  const receiver = await User.findById(receiverId, "_id relations");
  if (!receiver) {
    throw new UserDoesNotExistError(receiverId);
  }

  // Create new relation
  const newRelationdId = await getNextSequence("relation");
  sender.relations.push({
    _id: newRelationdId,
    relatedUserId: receiverId,
    type: "outgoing",
  });
  receiver.relations.push({
    _id: newRelationdId,
    relatedUserId: senderId,
    type: "incoming",
  });

  await sender.save();
  await receiver.save();

  return newRelationdId;
};

export const changeRelationStatus = async (
  userId: number,
  relationId: number,
  status: RelationStatus
) => {
  const { user: initiator, relation: initiatorRelation } =
    await getUserRelationPair(userId, relationId);
  const { user: affected, relation: affectedRelation } =
    await getUserRelationPair(initiatorRelation.relatedUserId, relationId);

  switch (status) {
    case "accepted":
      if (initiatorRelation.type !== "incoming") {
        throw new APIError(403, {
          message: "Relation cannot be accepted",
          details: "relation must have type=incoming to be acceptable",
        });
      }
      initiatorRelation.type = "relation";
      affectedRelation.type = "relation";
      break;
    case "rejected":
      if (initiatorRelation.type !== "incoming") {
        throw new APIError(403, {
          message: "Relation cannot be rejected",
          details: "relation must have type=incoming to be rejectable",
        });
      }
      deleteUserRelation(initiator, initiatorRelation);
      deleteUserRelation(affected, affectedRelation);
      break;
    case "canceled":
      if (initiatorRelation.type !== "outgoing") {
        throw new APIError(403, {
          message: "Relation cannot be canceled",
          details: "relation must have type=outgoing to be cancelable",
        });
      }
      deleteUserRelation(initiator, initiatorRelation);
      deleteUserRelation(affected, affectedRelation);
      break;
  }

  await initiator.save();
  await affected.save();
};

export const deleteRelation = async (userId: number, relationId: number) => {
  const { user: initiator, relation: initiatorRelation } =
    await getUserRelationPair(userId, relationId);
  const { user: affected, relation: affectedRelation } =
    await getUserRelationPair(initiatorRelation.relatedUserId, relationId);

  deleteUserRelation(initiator, initiatorRelation);
  deleteUserRelation(affected, affectedRelation);

  await initiator.save();
  await affected.save();
};

// ====================================
// HELPERS
// ====================================
const getUserRelationPair = async (userId: number, relationId: number) => {
  const user = await User.findById(userId, "relations");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  const relation = user.relations.find(
    (relation) => relation._id === relationId
  );
  if (!relation) {
    throw new RelationDoesNotExistError(userId, relationId);
  }

  return { user, relation };
};

const deleteUserRelation = (user: IUser, relation: IRelation) => {
  user.relations.filter((rel) => rel !== relation);
};
