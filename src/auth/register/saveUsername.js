const User = require("../../../engine/models/userModel");

module.exports = {
  name: "saveUsername",
  description:
    "Cek apakah username sudah digunakan dan simpan username jika belum digunakan",
  params: ["username"],
  paramTypes: {
    username: "string",
  },
  sampleRequest: {
    query: "cekUsername",
    params: {
      username: "exampleUser",
    },
  },
  middlewares: [],
  execute: async (req, res) => {
    const { username } = req.body;

    try {
      const user = await User.findOne({ username });
      if (user) {
        return res.status(200).json({ message: "Username sudah digunakan" });
      } else {
        const newUser = new User({ username });
        await newUser.save();
        return res
          .status(200)
          .json({ message: "Username belum digunakan dan telah disimpan" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Terjadi kesalahan saat pengecekan username" });
    }
  },
};
