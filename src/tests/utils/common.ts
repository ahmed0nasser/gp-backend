export const assertTestingEnv = () => {
  if (process.env.NODE_ENV !== "testing") {
    throw new Error('NODE_ENV environment variable is not set to "testing"');
  }
};
