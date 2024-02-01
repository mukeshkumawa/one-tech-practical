import { appendFileSync } from 'fs';
import moment from 'moment';
import { writeErrorLog } from "../helper/index.js";

export default async(req, res, next) => {
  try {
    const requestURL = req.protocol + "://" + req.get('host') + req.originalUrl;
    const requestBody = JSON.stringify(req.body);
    const date =  moment().format('MMMM Do YYYY, h:mm:ss a');
     appendFileSync('request.log', "REQUEST DATE : "+date+"\n"+"API URL : "+requestURL+"\n"+"API PARAMETER : "+requestBody+"\n\n");// , function (
    next();
    
  } catch (err) {
    const requestURL = req.protocol + "://" + req.get('host') + req.originalUrl;
    const requestBody = JSON.stringify(req.body);
    const writeErrorRequest = writeErrorLog(requestURL,requestBody,err);
  }
};
