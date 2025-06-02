import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  oldpass: {
    type: String,
  },
  newpass: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
