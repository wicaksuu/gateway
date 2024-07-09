const mongoose = require("mongoose");

const telegramBotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    deskripsi: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const TelegramBotModel = mongoose.model("TelegramBot", telegramBotSchema);
module.exports = TelegramBotModel;
