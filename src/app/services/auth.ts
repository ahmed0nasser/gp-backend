import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getNextSequence } from "../models/counter";
import { UserRole } from "../schemas/database/user";
import User from "../models/user";
import APIError from "../errors/APIError";
import userClaimSchema from "../schemas/validation/userClaim";
import UserDoesNotExistError from "../errors/UserDoesNotExistError";

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
  role: UserRole;
}

interface UserLogin {
  email: string;
  password: string;
}

interface UserTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserClaim {
  id: number;
  role: UserRole;
}

// Access Token expiration
const expiresIn = "1h";

export const registerNewUser = async ({
  firstName,
  lastName,
  email,
  password,
  role,
}: NewUser): Promise<number> => {
  const isSameEmailUser = await User.exists({ email });
  if (isSameEmailUser) {
    throw new APIError(409, { message: "Email is already used" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const userId = await getNextSequence("user");
  await User.create({
    _id: userId,
    firstName,
    lastName,
    email,
    passwordHash,
    role,
  });

  return userId;
};

export const loginUser = async ({
  email,
  password,
}: UserLogin): Promise<UserTokens> => {
  const sameEmailUser = await User.findOne({ email }, "_id passwordHash role");
  if (!sameEmailUser) {
    throw new APIError(404, { message: "No user with matching email" });
  }

  const result = await bcrypt.compare(password, sameEmailUser.passwordHash);
  if (!result) {
    throw new APIError(401, { message: "Wrong password" });
  }

  // Token payload
  const userClaim: UserClaim = {
    id: sameEmailUser.id,
    role: sameEmailUser.role,
  };

  // Generate tokens
  const accessToken = jwt.sign(
    userClaim,
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn }
  );
  const refreshToken = jwt.sign(
    userClaim,
    process.env.REFRESH_TOKEN_SECRET as string
  );

  // Store refreshToken in DB
  sameEmailUser.refreshToken = refreshToken;
  await sameEmailUser.save();

  return { accessToken, refreshToken, expiresIn };
};

export const refreshUserAccessToken = async (
  refreshToken: string
): Promise<string> => {
  const isSameUserRefreshToken = await User.exists({ refreshToken });
  if (!isSameUserRefreshToken) {
    throw new APIError(404, { message: "Invalid refresh token" });
  }

  let userClaim;
  try {
    userClaim = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );      
  } catch (_) {
    throw new APIError(404, { message: "Invalid refresh token" });
  }

  await validateUserClaim(userClaim);

  const accessToken = jwt.sign(
    userClaim,
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn }
  );

  return accessToken;
};

export const logoutUser = async (userId: number) => {
  const user = await User.findById(userId, "_id");
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  // Reset refreshToken
  user.refreshToken = "";

  await user.save();
};

export const authUser = async (token: string): Promise<UserClaim> => {
  let userClaim;
  try {
    userClaim = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );     
  } catch (_) {
    throw new APIError(404, { message: "Invalid access token" });
  }

  await validateUserClaim(userClaim);

  return userClaim as UserClaim;
};

// ====================================
// HELPERS
// ====================================
const validateUserClaim = async (userClaim: unknown) => {
  await userClaimSchema.validateAsync(userClaim);
};
