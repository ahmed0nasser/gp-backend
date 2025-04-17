import express from "express";
import authRouter from "./routes/auth";
import meRouter from "./routes/me";
import usersRouter from "./routes/users";
import relationsRouter from "./routes/relations";
import notificationsRouter from "./routes/notifications";
import errorHandler from "./middleware/errorHandler";
import authUserHandler from "./middleware/authUserHandler";
import mongoose from "mongoose";

const app = express();

// ====================================
// DB CONNECTION
// ====================================
const DB_CONNECTION_STRING = (
  process.env.NODE_ENV === "testing" ? process.env.TEST_DB : process.env.DB
) as string;
mongoose.connect(DB_CONNECTION_STRING).catch((err) => console.log(err));

// ====================================
// MIDDLEWARE
// ====================================
app.use(express.json());

// ====================================
// ROUTERS
// ====================================
app.use("/auth", authRouter);
app.use("/me", authUserHandler, meRouter);
app.use("/users", authUserHandler, usersRouter);
app.use("/relations", authUserHandler, relationsRouter);
app.use("/notifications", authUserHandler, notificationsRouter);

// ====================================
// ALL HANDLER
// ====================================
// #TODO: implement
// app.all();

// ====================================
// ERROR HANDLERS
// ====================================
app.use(errorHandler);

// ====================================
// START SERVER
// ====================================
app.listen(process.env.PORT, () => {
  if (process.env.NODE_ENV !== "testing") console.log("Server is listening...");
});

export default app;
