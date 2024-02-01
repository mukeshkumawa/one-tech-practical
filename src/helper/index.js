import mongoose from "mongoose";
import moment from "moment";
import { appendFileSync } from "fs";

export async function getValidImageUrl(profile_pic, name = "SH") {
  if (profile_pic) {
    profile_pic = process.env.URL + profile_pic;
  } else {
    profile_pic =
      "https://ui-avatars.com/api/?name=" +
      name +
      "&rounded=true&background=c39a56&color=fff";
  }
  return profile_pic.replace(/\\/g, "/");
}

export async function writeErrorLog(req, error) {
  const requestURL = req.protocol + "://" + req.get("host") + req.originalUrl;
  const requestBody = JSON.stringify(req.body);
  const date = moment().format("MMMM Do YYYY, h:mm:ss a");
  appendFileSync(
    "errorLog.log",
    "REQUEST DATE : " +
      date +
      "\n" +
      "API URL : " +
      requestURL +
      "\n" +
      "API PARAMETER : " +
      requestBody +
      "\n" +
      "Error : " +
      error +
      "\n\n"
  );
}

export async function generateRandomString(length, isNumber = false) {
  var result = "";
  if (isNumber) {
    var characters = "0123456789";
  } else {
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  }
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
