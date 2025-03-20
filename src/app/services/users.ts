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
  phoneNumber: number;
  title?: string;
  organization?: string;
  impairment?: string;
  img: string;
  email: string;
  role: UserRole;
}

export const getUserInfoById = async (userId: number): Promise<UserInfo> => {
  const user = await User.findById(
    userId,
    "_id firstName lastName role img title"
  );
  if (!user) {
    // Invalid userId
    throw new Error();
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
    // Invalid userId
    throw new Error();
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
