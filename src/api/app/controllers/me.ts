import { Request, RequestHandler } from "express";
import {
  changeUserProfile,
  getUserInfoById,
  getUserProfileById,
} from "../services/users";
import { getRelationsByUserId } from "../services/relations";
import { Duration, getVitalStatsByUserId } from "../services/vitalStats";
import UnableAuthenticateUserError from "../errors/UnableAuthenticateUserError";
import { pairDevice, unpairDevice } from "../services/devices";

export const meInfoController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const userInfo = await getUserInfoById(req.userClaim.id);

    res.status(200).json({ status: "success", data: userInfo });
    return;
  } catch (error) {
    next(error);
  }
};

export const meRelationsController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const relations = await getRelationsByUserId(req.userClaim.id);

    res.status(200).json({ status: "success", data: relations });
    return;
  } catch (error) {
    next(error);
  }
};

export const meProfileController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const userProfile = await getUserProfileById(req.userClaim.id);

    res.status(200).json({ status: "success", data: userProfile });
    return;
  } catch (error) {
    next(error);
  }
};

export const meChangeProfileController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    await changeUserProfile(req.userClaim.id, req.body);

    res.sendStatus(204);
    return;
  } catch (error) {
    next(error);
  }
};

export const meVitalStatsController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const vitalStats = await getVitalStatsByUserId(
      req.userClaim.id,
      req.query.duration as Duration,
      req.query.limit ? Number(req.query.limit) : undefined
    );

    res.status(200).json({
      status: "success",
      data: {
        userId: req.userClaim.id,
        size: vitalStats.length,
        duration: req.query.duration,
        vitalStats,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const mePairDeviceController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    await pairDevice(Number(req.userClaim.id), req.body.deviceId);

    res.sendStatus(204);
    return;
  } catch (error) {
    next(error);
  }
};

export const meUnpairDeviceController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    await unpairDevice(Number(req.userClaim.id));

    res.sendStatus(204);
    return;
  } catch (error) {
    next(error);
  }
};
