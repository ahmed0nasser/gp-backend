class NotPatientError extends Error {
  constructor() {
    super("User must be patient");
  }
}

export default NotPatientError;
