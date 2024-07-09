const UserModel = require("../../engine/models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  name: "login",
  description: "User login test",
  params: ["username", "password"],
  paramTypes: {
    username: "string",
    password: "string",
  },
  sampleRequest: {
    query: "login",
    params: {
      username: "exampleUser",
      password: "examplePassword",
    },
  },
  middlewares: [],
  execute: async (req, res) => {
    const { username, password } = req.body.params;
    if (!username || typeof username !== "string") {
      return res
        .status(400)
        .json({ message: { username: "Username tidak valid" } });
    }
    if (!password || typeof password !== "string") {
      return res
        .status(400)
        .json({ message: { password: "Password tidak valid" } });
    }

    try {
      const user = await UserModel.findOne({
        $or: [{ username }, { whatsapp: username }],
      });
      if (!user) {
        return res
          .status(401)
          .json({ message: { username: "Username tidak terdaftar" } });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: { password: "Password salah" } });
      }

      const token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          permission: user.permission,
          whatsapp: user.whatsapp,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("authorization", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        domain: "https://localhost:4321",
      });
      res.status(200).json({
        data: {
          token: token,
          user: {
            id: user._id,
            username: user.username,
            permission: user.permission,
            whatsapp: user.whatsapp,
            role: user.role,
          },
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: { server: "Terjadi kesalahan pada server" } });
    }
  },
};
