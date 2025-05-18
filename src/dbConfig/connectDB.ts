import mongoose from "mongoose";

const DB_CONNECTION_STRING = (
  process.env.NODE_ENV === "testing" ? process.env.TEST_DB : process.env.DB
) as string;

export default () =>
  mongoose.connection.readyState === 0 &&
  mongoose.connect(DB_CONNECTION_STRING).catch((err) => console.log(err));
