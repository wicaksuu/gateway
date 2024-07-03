const { Switch } = require("../../engine/Telegram/helper");
const TelegramBotModel = require("../../engine/models/telegramBotModel");
const TelegramBot = require("node-telegram-bot-api");

module.exports = {
  name: "Bot",
  description: "Menerima status dari server",
  params: ["data", "botId"],
  paramTypes: {
    data: "json",
    botId: "string",
  },
  sampleRequest: {
    query: "Bot",
    params: {
      data: {},
      botId: "example bot id",
    },
  },
  middlewares: [],
  execute: async (req, res) => {
    try {
      const { data, botId } = req.body.params;

      const botData = await TelegramBotModel.findById(botId);
      if (!botData) {
        return res
          .status(404)
          .json({ message: { bot: "Bot tidak terdaftar" } });
      }
      const bot = new TelegramBot(botData.token, { polling: false });
      await Switch(data, bot);
      res.status(200).json({ data: botData });
    } catch (error) {
      res.status(500).json({ message: "Bot Gagal di Indentifikasi" });
    }
  },
};
