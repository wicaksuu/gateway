const UserModel = require("../../engine/models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  name: "login",
  description: "User login",
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
      return res.status(400).json({ message: "Username tidak valid" });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Password tidak valid" });
    }

    try {
      const user = await UserModel.findOne({
        $or: [{ username }, { whatsapp: username }],
      });
      if (!user) {
        return res.status(401).json({ message: "Username tidak terdaftar" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Password salah" });
      }

      const token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          permission: user.permission,
          whatsapp: user.whatsapp,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).json({ data: token });
    } catch (error) {
      console.error("Error saat login:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  },
};
