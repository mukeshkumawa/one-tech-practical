import { Router } from "express";
const router = Router();
import UserCheckAuth from "../middleware/user-check-auth.js";
import * as ProductController from "../controllers/product.js";
import MakeRequest from "../middleware/make-request.js";
import { addProducts } from "../validation/validator.js";
import { generateRandomString } from "./../helper/index.js";

// multer
import multer, { diskStorage } from "multer";
const storage = diskStorage({
  destination: "./uploads/product",
  filename: async (req, file, cb) => {
    console.log(file);
    return cb(null, (await generateRandomString(10)) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Reject file
  console.log(file.mimetype)
  if (file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 40, // 40 MB
  },
  fileFilter: fileFilter,
});

/*App Routes goes here*/
router.post(
  "/",
  MakeRequest,
  UserCheckAuth,
  upload.single("product_csv"),
  addProducts,
  ProductController.createProducts
);

router.get("/", MakeRequest, UserCheckAuth, ProductController.getAllProducts);

export { router };
