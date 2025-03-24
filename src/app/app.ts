import express from "express";
import authRouter from "./routes/auth"
import meRouter from "./routes/me"
import usersRouter from "./routes/users"
import relationsRouter from "./routes/relations"

const app = express();

app.use(express.json());

// ====================================
// ROUTERS
// ====================================
app.use('/auth', authRouter);
app.use('/me', meRouter);
app.use('/users', usersRouter);
app.use('/relations', relationsRouter);

// ====================================
// START SERVER
// ====================================
app.listen(process.env.PORT, () => {
  console.log("Server is listening...");
});
