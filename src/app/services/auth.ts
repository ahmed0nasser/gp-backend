import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getNextSequence } from "../models/counter";
import { UserRole } from "../schemas/database/user";
import User from "../models/user";

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
    // TODO: Error for conflict, already existing email
    throw new Error();
  }
  try {
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
  } catch (error) {
    throw error;
  }
};

export const loginUser = async ({
  email,
  password,
}: UserLogin): Promise<UserTokens> => {
  const sameEmailUser = await User.findOne({ email }, "_id passwordHash role");
  if (!sameEmailUser) {
    // TODO: Error cannot authenticate unexisting user
    throw new Error();
  }
  try {
    const result = await bcrypt.compare(password, sameEmailUser.passwordHash);
    if (!result) {
      // TODO: Wrong password
      throw new Error();
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
  } catch (error) {
    throw error;
  }
};

export const refreshUserAccessToken = async (
  refreshToken: string
): Promise<string> => {
  const isSameUserRefreshToken = await User.exists({ refreshToken });
  if (!isSameUserRefreshToken) {
    // User non-exist or invalid refresh token
    throw new Error();
  }

  try {
    const userClaim = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as UserClaim;
    const accessToken = jwt.sign(
      userClaim,
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn }
    );
    return accessToken;
  } catch (error) {
    // Invalid refresh token, is not signed by the server
    throw error;
  }
};

export const logoutUser = async (userId: number) => {
  const user = await User.findById(userId, "_id");
  if (!user) {
    // User non-exist, invalid userId
    throw new Error();
  }
  user.refreshToken = "";
  await user.save();
};

export const authUser = async (
  token: string
): Promise<UserClaim | undefined> => {
  try {
    return jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as UserClaim;
  } catch (error) {
    throw error;
  }
};
