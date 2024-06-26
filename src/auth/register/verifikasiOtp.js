const User = require("../../../engine/models/userModel");

module.exports = {
  name: "verifikasiOtp",
  description: "Verifikasi kode OTP yang telah dikirim",
  params: ["whatsapp", "otp"],
  paramTypes: {
    whatsapp: "string",
    otp: "string",
  },
  sampleRequest: {
    query: "verifikasiOtp",
    params: {
      whatsapp: "081234567890",
      otp: "123456",
    },
  },
  middlewares: [],
  execute: async (req, res) => {
    const { whatsapp, otp } = req.body;

    try {
      const user = await User.findOne({ whatsapp });

      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ message: "Kode OTP salah" });
      }

      if (user.otpExpires < Date.now()) {
        return res.status(400).json({ message: "Kode OTP telah kadaluarsa" });
      }

      user.otp = null;
      user.otpExpires = null;
      await user.save();

      res.status(200).json({ message: "Verifikasi OTP berhasil" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Terjadi kesalahan saat verifikasi OTP" });
    }
  },
};
