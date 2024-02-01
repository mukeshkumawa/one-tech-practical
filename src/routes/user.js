import { Router } from "express";
const router = Router();
import UserCheckAuth from "../middleware/user-check-auth.js";
import * as UserController from "../controllers/user.js";
import MakeRequest from "../middleware/make-request.js";
import {
  userLogin,
  userRegister,
  userEdit,
  allUsers,
} from "../validation/validator.js";
import { generateRandomString } from "./../helper/index.js";

// multer
import multer, { diskStorage } from "multer";
const storage = diskStorage({
  destination: "./uploads/user",
  filename: async (req, file, cb) => {
    return cb(null, (await generateRandomString(10)) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Reject file
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 4,
  },
  fileFilter: fileFilter,
});

/*App Routes goes here*/
router.post("/login", MakeRequest, userLogin, UserController.login);
router.post("/signup", MakeRequest, userRegister, UserController.signup);
router.get("/auth", MakeRequest, UserCheckAuth, UserController.auth);
router.patch("/:id", MakeRequest, UserCheckAuth, UserController.userDetail);
router.delete("/:id", MakeRequest, UserCheckAuth, UserController.deleteUser);
router.put(
  "/:id",
  MakeRequest,
  UserCheckAuth,
  upload.single("profile_pic"),
  userEdit,
  UserController.edit
);
router.get("/all", MakeRequest, allUsers, UserController.allUsers);
export { router };
