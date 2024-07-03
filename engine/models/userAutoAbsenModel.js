const mongoose = require("mongoose");
const User = require("./userModel");

const userAutoAbsenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    imei: {
      type: String,
      required: true,
      unique: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const UserAutoAbsenModel = mongoose.model("UserAutoAbsen", userAutoAbsenSchema);
module.exports = UserAutoAbsenModel;
