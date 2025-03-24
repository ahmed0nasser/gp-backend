import APIError from "./APIError";

class RelationDoesNotExistError extends APIError {
  constructor(userId: number, relationId: number) {
    super(401, {
      message: "Invalid relation id",
      details: `user with id=${userId} does not have relation with id=${relationId}`,
    });
  }
}

export default RelationDoesNotExistError;
