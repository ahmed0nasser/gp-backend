import { model } from "mongoose";
import userSchema, { IUser } from "../schemas/database/user";

const User = model<IUser>("User", userSchema);

export default User;
