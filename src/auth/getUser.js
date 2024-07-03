const UserModel = require("../../engine/models/userModel");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../engine/middleware/authMiddleware");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  name: "getUser",
  description: "Get user details",
  params: [],
  paramTypes: {},
  sampleRequest: {
    query: "getUser",
    params: {},
  },
  middlewares: [authMiddleware],
  execute: async (req, res) => {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res
          .status(404)
          .json({ message: { user: "User tidak ditemukan" } });
      }

      res.status(200).json({
        data: {
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            permission: user.permission,
            whatsapp: user.whatsapp,
            role: user.role,
            photo: user.photo,
          },
        },
      });
    } catch (error) {
      console.error("Error saat mendapatkan user:", error);
      res
        .status(500)
        .json({ message: { server: "Terjadi kesalahan pada server" } });
    }
  },
};
