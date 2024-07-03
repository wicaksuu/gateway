const axios = require("axios");
const ipaddr = require("ipaddr.js");

const TELEGRAM_IP_RANGES = ["149.154.160.0/20", "91.108.4.0/22"];
const telegramBotToken = "1240654937:AAHuoyXeFjhqddS3Ie1OwhanLzzHDulhdEY";
const telegramChatId = 1218095835;

const ipInRange = (ip, ranges) => {
  if (!ip) return false;
  const addr = ipaddr.parse(ip);
  return ranges.some((range) => {
    const [rangeAddr, rangeMask] = range.split("/");
    const parsedRange = ipaddr.parseCIDR(`${rangeAddr}/${rangeMask}`);
    return addr.match(parsedRange);
  });
};

const headerControl = async (req, res, next) => {
  if (req.path !== "/") {
    return res.status(400).json({
      messages: {
        error: req.path,
        errorMessage: "Permintaan Salah",
      },
    });
  }

  if (ipInRange(req.headers["x-real-ip"], TELEGRAM_IP_RANGES)) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          chat_id: telegramChatId,
          text: JSON.stringify({ body: req.body, header: req.headers }),
        }
      );
    } catch (error) {
      console.error("Kesalahan mengirim pesan:", error);
    }
  }

  next();
};

module.exports = headerControl;
