import dbConfig from './src/config/db.js'
import bodyParser from "body-parser"
import expand from "dotenv-expand"
import mongoose from "mongoose"
expand.expand(dotenv.config())
import express from "express"
import dotenv from "dotenv"
const app = express()
import morgan from "morgan"


/*Routes Define goes here*/
import { router } from "./src/routes/v1.js";
/*End of Routes Define*/

mongoose.Promise = global.Promise

// debug middleware check api console
app.use(morgan("dev"))

// json data accept 
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// Define you assets directory here
app.use("/uploads", express.static("uploads"))


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE")
    return res.status(200).json({})
  }
  next()
})

/*Create Route Groups Here*/
app.use(router);
/*End Route Groups Here*/

// 404 error
app.use((req, res, next) => {
  const error = new Error("Opps...!! You have lost. Please check API document.")
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    message: error.message,
  })
})

export default app