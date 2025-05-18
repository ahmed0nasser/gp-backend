class UnableAuthenticateUserError extends Error {
  constructor() {
    super("Unable to authenticate user");
  }
}

export default UnableAuthenticateUserError;
