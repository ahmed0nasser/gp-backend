import APIError from "./APIError";

class UserDoesNotExistError extends APIError {
  constructor(userId: number) {
    super(404, {
      message: "Invalid user id",
      details: `user with id=${userId} does not exist`,
    });
  }
}

export default UserDoesNotExistError;
