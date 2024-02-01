import dotenv from "dotenv"
dotenv.config()
import mongoose from 'mongoose'
mongoose.connect(
    `mongodb+srv://${process.env.MONGO_UR}:${process.env.MONGO_PWD}@cluster0.jky3l.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then((res) => {
    console.log('Connected DB...')
  })
  .catch((err) => {
    console.log(err)
  })

export default mongoose
