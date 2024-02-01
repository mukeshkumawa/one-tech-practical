import express from "express";
const router = express.Router();
import { router as userRoutes } from "./user.js";
import { router as productRoutes } from "./product.js";

// route group goes here
router.use('/v1/user', userRoutes);

router.use('/v1/product', productRoutes);

export { router };