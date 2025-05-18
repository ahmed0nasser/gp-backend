import express from "express";
import authRouter from "./routes/auth";
import meRouter from "./routes/me";
import usersRouter from "./routes/users";
import relationsRouter from "./routes/relations";
import notificationsRouter from "./routes/notifications";
import errorHandler from "./middleware/errorHandler";
import authUserHandler from "./middleware/authUserHandler";
import connectDB from "../../dbConfig/connectDB";

const app = express();

// ====================================
// DB CONNECTION
// ====================================
connectDB();

// ====================================
// MIDDLEWARE
// ====================================
app.use(express.json());

// ====================================
// ROUTERS
// ====================================
app.use((req, res, next) => {
  console.log(req.ip, req.method, req.originalUrl);
  console.log(req.body);
  console.log("===================");
  next();
});
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
app.listen(process.env.API_PORT, () => {
  if (process.env.NODE_ENV !== "testing") console.log("Server is listening...");
});

export default app;
