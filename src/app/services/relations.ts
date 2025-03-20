import User from "../models/user";
import { RelationType } from "../schemas/database/relation";
import { getUserInfoById, UserInfo } from "./users";

export interface UserRelation {
  id: number;
  type: RelationType;
  user?: UserInfo;
}

export const getRelationsByUserId = async (
  userId: number
): Promise<UserRelation[]> => {
  const user = await User.findById(userId, "relations");
  if (!user) {
    throw new Error();
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
