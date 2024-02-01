import { messages } from "./../config/response.messages.js";
import UserDB from "../models/user.js";
import jwt from "jsonwebtoken";

export default async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const { id } = decoded;
    const userData = await UserDB.findOne({
      _id: id,
      active_flag: { $in: [1, 2] },
    });
    if (userData === null) {
      return res.status(403).json({
        message: messages.auth_fail,
      });
    } else if (userData && userData.active_flag == 2) {
      return res.status(403).json({
        message: messages.account_deactivated
      });
    }
    req.userData = userData;
    next();
  } catch (err) {
    return res.status(403).json({
      message: err.message ? err.message : messages.auth_fail
    });
  }
};