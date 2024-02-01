import RecruiterPostDB from "../models/recruiterPost.js";
import UserDB from "../models/user.js";
import PostDB from "../models/post.js";
import moment from "moment";

export async function list(data) {
  try {
    let option = {
      page: data.page,
      limit: data.limit,
    };
    let matchObj = {};
    matchObj.active_flag = { $in: [1, 2] };
    matchObj.role = 3;
    if (data.search) {
      matchObj.$or = [
        { name: { $regex: data.search, $options: "i" } },
        { email: { $regex: data.search, $options: "i" } },
      ];
    }
    let recruiterAggregate = UserDB.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
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
          flag_string: {
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

    let result = await UserDB.aggregatePaginate(recruiterAggregate, option);
    return result;
  } catch (err) {
    throw new Error(err);
  }
}

export async function deleteClient(updateObj, id, session) {
  updateObj.email = updateObj.email + "-" + moment().unix();
  try {
    return await UserDB.findOneAndUpdate({ _id: id }, updateObj, {
      returnDocument: "after",
      session,
    });
  } catch (err) {
    throw new Error(err);
  }
}

export async function createPost(createObj, recruiter_data, session) {
  try {
    let postResult = await PostDB.create([createObj], { session });

    // insert mapping data
    
    await RecruiterPostDB.create([{recruiter_id: recruiter_data._id, post_id: postResult[0]._id}, { session }]);
    
    // can notify here recruiter by mail or notification
    
    return postResult[0]

  } catch (err) {
    throw new Error(err);
  }
}

export async function getPost(data) {
  try {
    let option = {
      page: data.page,
      limit: data.limit,
    };
    let matchObj = {};
    matchObj.active_flag = 1;
    matchObj.client_id = data.client_id
    if (data.search) {
      matchObj.$or = [
        { title: { $regex: data.search, $options: "i" } },
        { description: { $regex: data.search, $options: "i" } },
      ];
    }
    let jobPostAggregate = PostDB.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "recruiterposts",
          let: {
            post_id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$post_id", "$$post_id"],
                    },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "users",
                let: {
                  recruiter_id: "$recruiter_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$active_flag", 1],
                          },
                          {
                            $eq: ["$_id", "$$recruiter_id"],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "recruiter_data",
              },
            },
            {
              $unwind: {
                path: "$recruiter_data",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $project: {
                _id: 1,
                comment: 1,
                recruiter_data: { _id: 1, full_name: 1 },
              },
            },
          ],
          as: "comment_data",
        },
      },
      {
        $unwind: {
          path: "$comment_data",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: matchObj,
      },
      {
        $project: {
          _id: 1,
          comment_data: "$comment_data",
          title: 1,
          description: 1,
          active_flag: 1,
          createdAt: 1,
        },
      },
    ]);

    let result = await PostDB.aggregatePaginate(
      jobPostAggregate,
      option
    );
    return result;
  } catch (err) {
    throw new Error(err);
  }
}