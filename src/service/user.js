import mongoose from "mongoose";
import UserDB from "../models/user.js";
import moment from "moment";

export async function checkEmail(data) {
  try {
    return await UserDB.findOne({
      email: data.email,
      active_flag: { $ne: 3 }
    }).lean();
  } catch (err) {
    throw new Error(err);
  }
}

export async function createUser(data, session) {
  try {
    let result = await UserDB.create([data], { session });
    return result[0];
  } catch (err) {
    throw new Error(err);
  }
}

export async function updateUser(updateObj, id, session) {
  try {
    let result = await UserDB.findOneAndUpdate({ _id: id }, updateObj, {
      returnDocument: "after",
      session,
    });
    return result;
  } catch (err) {
    throw new Error(err);
  }
}

export async function userDetails (id) {
  try {
    let result = await UserDB.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(id),
          active_flag: {$ne: 3}
        }
      },
      {
        $project: {
          _id: 1,
          full_name: 1,
          email: 1,
          profile_pic: 1,
          active_flag: 1,
          status: {
            $cond: {
              if: { $eq: ["$active_flag", 1] },
              then: "Enable",
              else: "Disable"
            }
          }
        }
      }
    ]);
    return result[0];
  } catch (err) {
    throw new Error(err);
  }
}

export async function deleteUser(id, email, session) {
  try {
    let result = await UserDB.findOneAndUpdate({ _id: id }, {active_flag: 3, email: email + '+' + moment().unix()}, {
      returnDocument: "after",
      session,
    });
    return result;
  } catch (err) {
    throw new Error(err);
  }
}

export async function getAllUsers(data) {
  try {
    let option = {
      page: data.page,
      limit: data.limit,
    };
    let matchObj = {};
    matchObj.active_flag = { $ne: 3 };
    if (data.search) {
      matchObj.$or = [
        { full_name: { $regex: data.search, $options: "i" } },
        { email: { $regex: data.search, $options: "i" } },
      ];
    }
    let sortObj = {}
    if (data.orderto && data.orderby) {
      sortObj[data.orderto] = parseInt(data.orderby)
    }
    let userAggregate = UserDB.aggregate([
      {
        $sort: sortObj
      },
      {
        $match: matchObj,
      },
      {
        $project: {
          _id: 1,
          full_name: 1,
          email: 1,
          profile_pic: 1,
          active_flag: 1,
          status: {
            $cond: {
              if: { $eq: ["$active_flag", 1] },
              then: "Enable",
              else: "Disable",
            },
          },
          createdAt: 1,
        },
      },
    ]);
    let result = await UserDB.aggregatePaginate(userAggregate, option);
    return result
  } catch (err) {
    throw new Error(err);
  }
}