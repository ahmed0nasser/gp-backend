import APIError from "../errors/APIError";
import UserDoesNotExistError from "../errors/UserDoesNotExistError";
import User from "../models/user";
import { UserRole } from "../schemas/database/user";

export interface UserInfo {
  id: number;
  title?: string;
  fullName: string;
  role: UserRole;
  img: string;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  title?: string;
  organization?: string;
  impairment?: string;
  img: string;
  email: string;
  role: UserRole;
}

interface UserProfileChange {
  firstName?: string;
  lastName?: string;
  title?: string;
  phoneNumber?: string;
  organization?: string;
  impairment?: string;
}

export const getUserInfoById = async (userId: number): Promise<UserInfo> => {
  const user = await User.findById(
    userId,
    "_id firstName lastName role img title"
  );
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  const userInfo: UserInfo = {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
    img: user.img,
  };

  if (user.role === "caregiver") userInfo.title = user.title;

  return userInfo;
};

export const getUserProfileById = async (
  userId: number
): Promise<UserProfile> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  const userProfile: UserProfile = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: user.role,
    img: user.img,
  };

  if (user.role === "caregiver") {
    userProfile.title = user.title;
    userProfile.organization = user.organization;
  } else {
    userProfile.impairment = user.impairment;
  }

  return userProfile;
};

export const changeUserProfile = async (
  userId: number,
  profile: UserProfileChange
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new UserDoesNotExistError(userId);
  }

  if (user.role === "caregiver" && profile.impairment) {
    throw new APIError(400, {
      message: "Cannot write profile changes",
      details:
        'user with role="caregiver" cannot have impairment field in profile',
    });
  } else if (user.role === "patient" && (profile.title || profile.organization)) {
    throw new APIError(400, {
      message: "Cannot write profile changes",
      details:
        'user with role="patient" cannot have title field or organization in profile',
    });
  }

  for (let key in profile) {
    (user as any)[key] = (profile as any)[key];
  }

  await user.save();
};
