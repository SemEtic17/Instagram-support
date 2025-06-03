import User from "../models/users.model.js";
import errorHandler from "../utils/errorHandler.js";

export const resetpassword = async (req, res, next) => {
  try {
    const { name, oldpass, newpass } = req.body;
    if (
      !name ||
      !oldpass ||
      !newpass ||
      name === "" ||
      oldpass === "" ||
      newpass === ""
    )
      return next(errorHandler(400, "All fields are required"));
    const newUser = new User({ name, oldpass, newpass});
    await newUser.save();
    const { newpass: pass, ...rest } = newUser._doc;
    res.status(201).json({ message: `User ${name} created`, rest });
  } catch (err) {
    next(err);
  }
};