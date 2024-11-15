const { handlePaymentCallback } = require("../../engine/Telegram/mtrans");
const UserModel = require("../../engine/models/userModel");

module.exports = {
  name: "Webhook",
  description: "Menerima notifikasi dari payment gateway wicaksu",
  params: ["data", "hook"],
  paramTypes: {
    data: "json",
    hook: "string",
  },
  sampleRequest: {
    query: "Webhook",
    params: {
      data: {},
      hook: "webhook",
    },
  },
  middlewares: [],
  execute: async (req, res) => {
    const { data, hook } = req.body.params;

    if (hook === "webhook") {
      const { order_id } = data;
      const orderIdParts = order_id.split("-");
      const username = orderIdParts[2];
      const user = await UserModel.findOne({ username: username });
      if (user) {
        const replay = await handlePaymentCallback(data, user);
        return res.status(200).json({ replay });
      } else {
        console.error("Error: User tidak ditemukan");
        return res.status(404).json({ message: "User tidak ditemukan" });
      }
    }

    return res
      .status(500)
      .json({ message: "Notifikasi Gagal di Indentifikasi" });
  },
};
