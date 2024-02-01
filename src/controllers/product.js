import { messages } from "./../config/response.messages.js";
import * as ProductService from "../service/product.js";
import * as Helper from "./../helper/index.js";
import db from "./../config/db.js";
import csv from "csvtojson";

export async function createProducts(req, res) {
  const session = await db.startSession();
  try {
    let { id } = req.userData;
    session.startTransaction();

    let dataArray = await csv().fromFile(req.file.path);
    const result = await ProductService.createProducts(dataArray, id, session);

    // remove file after add product
    // fs.readFile(req.file.path, (err, data) => {
    //   if (!err && data) {
    //     fs.unlink(req.file.path);
    //   }
    // });

    await session.commitTransaction();
    return res.status(201).send({
      message: messages.product_added_success,
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

export async function getAllProducts(req, res) {
  if ([null, undefined, 0, ""].includes(req.query.page)) {
    req.query.page = 1;
  }
  if ([null, undefined, 0, ""].includes(req.query.limit)) {
    req.query.limit = process.env.PAGINATE_LIMIT || 10;
  }
  if ([null, undefined, 0, ""].includes(req.query.search)) {
    req.query.search = "";
  }
  try {
    let result = await ProductService.getAllProducts(req.query);
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
