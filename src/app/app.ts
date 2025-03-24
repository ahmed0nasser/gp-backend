import express from "express";
import authRouter from "./routes/auth";
import meRouter from "./routes/me";
import usersRouter from "./routes/users";
import relationsRouter from "./routes/relations";
import errorHandler from "./middleware/errorHandler";
import authUserHandler from "./middleware/authUserHandler";

const app = express();

app.use(express.json());

// ====================================
// ROUTERS
// ====================================
app.use("/auth", authRouter);
app.use("/me", authUserHandler, meRouter);
app.use("/users", authUserHandler, usersRouter);
app.use("/relations", authUserHandler, relationsRouter);

// ====================================
// ERROR HANDLERS
// ====================================
app.use(errorHandler);

// ====================================
// START SERVER
// ====================================
app.listen(process.env.PORT, () => {
  console.log("Server is listening...");
});
