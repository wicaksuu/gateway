const User = require("../../../engine/models/userModel");
const dotenv = require("dotenv");
// const twilio = require("twilio");

dotenv.config();

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = new twilio(accountSid, authToken);

module.exports = {
  name: "sendOtpRegister",
  description: "Mengirimkan kode OTP untuk registrasi",
  params: ["whatsapp"],
  paramTypes: {
    whatsapp: "string",
  },
  sampleRequest: {
    query: "sendOtpRegister",
    params: {
      whatsapp: "081234567890",
    },
  },
  middlewares: [],
  execute: async (req, res) => {
    const { whatsapp } = req.body;

    try {
      const existingUser = await User.findOne({ whatsapp });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Nomor whatsapp sudah digunakan" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

      // await client.messages.create({
      //   body: `Kode OTP Anda adalah ${otp}`,
      //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      //   to: `whatsapp:${whatsapp}`,
      // });

      const newUser = new User({
        whatsapp,
        otp,
        otpExpires,
      });

      await newUser.save();

      res.status(200).json({ message: "Kode OTP telah dikirim" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengirim kode OTP" });
    }
  },
};
