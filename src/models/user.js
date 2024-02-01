import mongoose from "mongoose"
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
const userSchema = mongoose.Schema(
  {
    full_name: {
      type: String,
      default:'',
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    profile_pic: {
      type: String,
      default:'',
      trim: true
    },
    password: {
      type: String,
      trim: true,
      default:''
    },
    active_flag: { 
      type: Number, 
      default:1,
      enum: [1, 2, 3] 
      // 1 = enable, 2 = disable,3 = deleted
    }
  },
  { timestamps: true }
)
userSchema.plugin(aggregatePaginate)
export default mongoose.model("User", userSchema)