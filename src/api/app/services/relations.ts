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
  user?: UserInfo | { id: number };
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
        user:
          relation.type === "outgoing"
            ? { id: relation.relatedUserId }
            : await getUserInfoById(relation.relatedUserId),
      };

      return userRelation;
    })
  );

  return userRelations;
};

export const areRelated = async (
  userId1: number,
  userId2: number
): Promise<boolean> => {
  const user = await User.findById(userId1, "relations");
  if (!user) {
    throw new UserDoesNotExistError(userId1);
  }

  return user.relations.some(
    (relation) =>
      relation.type === "relation" && relation.relatedUserId == userId2
  );
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
  if (senderId === receiverId) {
    throw new APIError(403, {
      message: "Cannot send relation request to yourself",
    });
  }

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
      deleteUserRelation(initiator, relationId);
      deleteUserRelation(affected, relationId);
      break;
    case "canceled":
      if (initiatorRelation.type !== "outgoing") {
        throw new APIError(403, {
          message: "Relation cannot be canceled",
          details: "relation must have type=outgoing to be cancelable",
        });
      }
      deleteUserRelation(initiator, relationId);
      deleteUserRelation(affected, relationId);
      break;
  }

  await initiator.save();
  await affected.save();
};

export const deleteRelation = async (userId: number, relationId: number) => {
  const { user: initiator, relation: initiatorRelation } =
    await getUserRelationPair(userId, relationId);

  if (initiatorRelation.type !== "relation") {
    throw new APIError(403, {
      message: "Cannot delete relation",
      details: 'relation must be of type="relation" to be deletable',
    });
  }

  const affected = await User.findById(
    initiatorRelation.relatedUserId,
    "relations"
  );
  if (!affected) {
    throw new UserDoesNotExistError(initiatorRelation.relatedUserId);
  }

  deleteUserRelation(initiator, relationId);
  deleteUserRelation(affected, relationId);

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

const deleteUserRelation = (user: IUser, relationId: number) => {
  user.relations = user.relations.filter(
    (relation) => relation._id !== relationId
  );
};
