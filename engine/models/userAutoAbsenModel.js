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
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const UserAutoAbsenModel = mongoose.model("UserAutoAbsen", userAutoAbsenSchema);
module.exports = UserAutoAbsenModel;
