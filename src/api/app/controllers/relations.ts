import { RequestHandler, Request } from "express";
import {
  changeRelationStatus,
  deleteRelation,
  getRelation,
} from "../services/relations";
import UnableAuthenticateUserError from "../errors/UnableAuthenticateUserError";

export const relationFetchController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    const relation = await getRelation(req.userClaim.id, Number(req.params.id));

    res.status(200).json({
      status: "success",
      data: relation,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const relationStatusController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }

    await changeRelationStatus(
      req.userClaim.id,
      Number(req.params.id),
      req.body.status
    );

    res.status(200).json({
      status: "success",
      message: "Relation request " + req.body.status + " successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const relationDeleteController: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  try {
    if (!req.userClaim) {
      throw new UnableAuthenticateUserError();
    }
    
    await deleteRelation(req.userClaim.id, Number(req.params.id));

    res.sendStatus(204);
    return;
  } catch (error) {
    next(error);
  }
};
