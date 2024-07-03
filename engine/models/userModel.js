const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    permission: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    otp: {
      type: String,
      required: false,
    },
    otpExpires: {
      type: Date,
      required: false,
    },
    photo: {
      type: String,
      required: false,
    },
    chatIdTelegram: {
      type: String,
      required: false,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    nip: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
