import express from "express";
import {
  resetpassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/reset-password", resetpassword);

export default router;
