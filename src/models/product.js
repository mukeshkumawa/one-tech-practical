import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    product_name: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      default: "",
    },
    product_pic: {
      type: String,
      required: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    active_flag: {
      type: Number,
      default: 1,
      enum: [1, 2, 3],
      // 1 = enable, 2 = disable,3 = deleted
    },
  },
  { timestamps: true }
);
productSchema.plugin(aggregatePaginate);
export default mongoose.model("Product", productSchema);
