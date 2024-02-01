import { messages } from "./../config/response.messages.js";
import * as UserService from "../service/user.js";
import * as Helper from "./../helper/index.js";
import db from "./../config/db.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function signup(req, res) {
  const session = await db.startSession();
  let { email, full_name, password, role } = req.body;
  try {
    session.startTransaction();
    const userData = await UserService.checkEmail(req.body);
    if (userData) {
      await session.commitTransaction();
      return res.status(409).send({
        message: messages.email_already_exist,
      });
    }
    const hash = await bcrypt.hash(password, 10);
    let createObj = {
      full_name,
      email,
      password: hash,
      active_flag: 1,
      role,
    };
    const result = await UserService.createUser(createObj, session);
    await session.commitTransaction();
    return res.status(201).send({
      message: messages.user_register_success,
      result: result,
    });
  } catch (err) {
    await session.abortTransaction();
    Helper.writeErrorLog(req, err);
    return res.status(500).send({
      message: err.message ? err.message : messages.error_occurred,
      error: err,
    });
  }
}

export async function login(req, res, next) {
  try {
    let { email, password } = req.body;
    let checkEmail = await UserService.checkEmail(req.body);
    if (checkEmail === null) {
      return res.status(400).send({
        message: messages.invalid_email_password,
      });
    }
    const passwordResult = await bcrypt.compare(password, checkEmail.password);
    if (passwordResult === false) {
      return res.status(400).send({
        message: messages.invalid_email_password,
      });
    }

    if (checkEmail.active_flag == 2) {
      return res.status(403).send({
        message: messages.account_deactivated,
      });
    }

    const token = jwt.sign(
      {
        email: checkEmail.email,
        id: checkEmail._id,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "10d",
      }
    );
    checkEmail.profile_pic = await Helper.getValidImageUrl(
      checkEmail.profile_pic,
      checkEmail.full_name
    );
    return res.status(200).send({
      message: messages.login_success,
      token: token,
      result: checkEmail,
    });
  } catch (err) {
    Helper.writeErrorLog(req, err);
    return res.status(500).send({
      message: err.message ? err.message : messages.error_occurred,
      error: err,
    });
  }
}

export async function auth(req, res, next) {
  try {
    const admin = req.userData;
    admin.profile_pic = await Helper.getValidImageUrl(
      admin.profile_pic,
      admin.full_name
    );
    return res.status(200).send({
      message: messages.user_found,
      result: admin,
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message ? err.message : messages.error_occurred,
      error: err,
    });
  }
}

export async function edit(req, res, next) {
  const session = await db.startSession();
  const { email, full_name } = req.body;
  try {
    session.startTransaction();
    let id = mongoose.Types.ObjectId(req.params.id);

    let checkEmail = await UserService.checkEmail(req.body);
    if (checkEmail && !checkEmail._id.equals(id)) {
      session.commitTransaction();
      return res.status(409).send({
        message: messages.email_used_by_another_user,
      });
    }

    const updateObj = {};
    updateObj.full_name = full_name;
    updateObj.email = email;
    if (req.file && req.file.path) {
      updateObj.profile_pic = req.file.path;
    }
    const userData = await UserService.updateUser(updateObj, id, session);
    userData.profile_pic = await Helper.getValidImageUrl(
      userData.profile_pic,
      userData.full_name
    );
    session.commitTransaction();
    return res.status(202).send({
      message: messages.profile_update_success,
      result: userData,
    });
  } catch (err) {
    await session.abortTransaction();
    Helper.writeErrorLog(req, err);
    return res.status(500).send({
      message: err.message ? err.message : messages.error_occurred,
    });
  }
}

export async function userDetail(req, res, next) {
  try {
    const { id } = req.params;
    let result = await UserService.userDetails(id)
    if (result) {
      result.profile_pic = await Helper.getValidImageUrl(result.profile_pic, result.full_name)
      return res.status(200).send({
        message: messages.user_found,
        result: result,
      });
    }
    return res.status(204).send({}); // no data found
  } catch (err) {
    return res.status(500).send({
      message: err.message ? err.message : messages.error_occurred,
      error: err,
    });
  }
}

export async function deleteUser(req, res, next) {
  const session = await db.startSession();
  try {
    session.startTransaction();
    const { id } = req.params;
    let checkUser = await UserService.userDetails(id)
    if (checkUser && checkUser.active_flag != 3) {
      
      await UserService.deleteUser(id, checkUser.email, session);
      
      session.commitTransaction();
      return res.status(202).send({
        message: messages.user_deleted_success,
      });
    }
    session.commitTransaction();
    return res.status(400).send({
      message: messages.user_not_found,
    });

    
  } catch (err) {
    await session.abortTransaction();
    Helper.writeErrorLog(req, err);
    return res.status(500).send({
      message: err.message ? err.message : messages.error_occurred,
    });
  }
}

export async function allUsers(req, res) {
  if ([null, undefined, 0, ""].includes(req.query.page)) {
    req.query.page = 1;
  }
  if ([null, undefined, 0, ""].includes(req.query.limit)) {
    req.query.limit = process.env.PAGINATE_LIMIT || 10;
  }
  if ([null, undefined, 0, ""].includes(req.query.search)) {
    req.query.search = "";
  }
  if ([null, undefined, 0, ""].includes(req.query.orderto)) {
    req.query.orderto = "_id";
  }
  if ([null, undefined, 0, ""].includes(req.query.orderby)) {

  }
  try {
    let result = await UserService.getAllUsers(req.query);
    return res.status(200).send({
      message: messages.success,
      result: result,
    });
  } catch (error) {
    Helper.writeErrorLog(req, error);
    return res.status(500).send({
      message: error.message ? error.message : messages.error_occurred,
      error: error,
    });
  }
}