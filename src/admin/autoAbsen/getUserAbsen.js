const UserAutoAbsenModel = require("../../../engine/models/userAutoAbsenModel");
const UserModel = require("../../../engine/models/userModel");
const jwt = require("jsonwebtoken");
const roleMiddleware = require("../../../engine/middleware/roleMiddleware");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  name: "getUserAbsen",
  description: "Mendapatkan detail absen pengguna",
  params: ["page", "limit", "search"],
  paramTypes: {
    page: "integer",
    limit: "integer",
    search: "string",
  },
  sampleRequest: {
    query: "getUserAbsen",
    params: {
      page: 1,
      limit: 10,
      search: "wicaksu",
    },
  },
  middlewares: [roleMiddleware()],
  execute: async (req, res) => {
    const params = req.body.params;
    try {
      const totalUserAbsen = await UserAutoAbsenModel.countDocuments();
      let query = {};
      if (params.search) {
        const users = await UserModel.find({
          $or: [
            { name: { $regex: params.search, $options: "i" } },
            { nip: { $regex: params.search, $options: "i" } },
            { username: { $regex: params.search, $options: "i" } },
            { whatsapp: { $regex: params.search, $options: "i" } },
            { chatIdTelegram: { $regex: params.search, $options: "i" } },
          ],
        }).select("_id");

        const userIds = users.map((user) => user._id);

        console.log(userIds);
        query = {
          user: { $in: userIds },
          $or: [
            { imei: { $regex: params.search, $options: "i" } },
            { url: { $regex: params.search, $options: "i" } },
          ],
        };
      }

      const userAbsen = await UserAutoAbsenModel.find(query)
        .populate("user")
        .skip((parseFloat(params.page) - 1) * parseFloat(params.limit))
        .limit(parseFloat(params.limit));

      const totalPage = Math.ceil(totalUserAbsen / parseFloat(params.limit));
      res.status(200).json({
        data: {
          user: userAbsen,
          page: {
            thisPage: parseFloat(params.page),
            nextPage: parseFloat(params.page) + 1,
            previousPage: parseFloat(params.page) - 1,
            limit: parseFloat(params.limit),
            totalPage: totalPage,
          },
        },
      });
    } catch (error) {
      console.error("Error saat mendapatkan user absen:", error);
      res
        .status(500)
        .json({ message: { server: "Terjadi kesalahan pada server" } });
    }
  },
};
