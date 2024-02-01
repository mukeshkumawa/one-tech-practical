import ProductDB from "./../models/product.js";

export async function createProducts(dataArray, user, session) {
  try {
    let prepareArray = [];
    prepareArray = dataArray.map((element) => {
      return {
        user,
        product_name: element["Product Name"],
        description: element["Description"],
        product_pic: element["Product Pic"],
        price: element["Price"],
        quantity: element["Quantity"],
      };
    });
    let result = await ProductDB.insertMany(prepareArray, { session });
    return result;
  } catch (err) {
    throw new Error(err);
  }
}

export async function getAllProducts(data) {
  try {
    let option = {
      page: data.page,
      limit: data.limit,
    };
    let matchObj = {};
    matchObj.active_flag = { $ne: 3 };
    if (data.search) {
      matchObj.$or = [
        { product_name: { $regex: data.search, $options: "i" } },
        { description: { $regex: data.search, $options: "i" } },
      ];
    }
    let productAggregate = ProductDB.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: matchObj,
      },
      {
        $lookup: {
          from: "users",
          let: {
            user: "$user",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$user"] },
                    { $eq: ["$active_flag", 1] },
                  ],
                },
              },
            },
          ],
          as: "user_details",
        },
      },
      {
        $unwind: {
          path: "$user_details",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          product_name: 1,
          description: 1,
          product_pic: 1,
          active_flag: 1,
          price: 1,
          quantity: 1,
          flag_string: {
            $cond: {
              if: { $eq: ["$active_flag", 1] },
              then: "Enable",
              else: "Disable",
            },
          },
          user_details: { _id: 1, full_name: 1 },
          createdAt: 1,
        },
      },
    ]);
    let result = await ProductDB.aggregatePaginate(productAggregate, option);
    return result;
  } catch (err) {
    throw new Error(err);
  }
}
