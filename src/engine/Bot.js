const { Switch } = require("../../engine/Telegram/helper");
const TelegramBotModel = require("../../engine/models/telegramBotModel");
const TelegramBot = require("node-telegram-bot-api");

module.exports = {
  name: "Bot",
  description: "Mendapat notifikasi dari bot telegram",
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

      // Percakapan untuk pendaftaran user baru
      bot.onText(/\/register/, async (msg) => {
        const chatId = msg.chat.id;
        let step = 0;
        let userData = {};

        const askName = () => {
          bot.sendMessage(
            chatId,
            "Selamat datang! Silakan masukkan nama Anda atau ketik /cancel untuk membatalkan:"
          );
        };

        const askEmail = () => {
          bot.sendMessage(
            chatId,
            "Silakan masukkan email Anda atau ketik /cancel untuk membatalkan:"
          );
        };

        const askPassword = () => {
          bot.sendMessage(
            chatId,
            "Silakan masukkan password Anda atau ketik /cancel untuk membatalkan:"
          );
        };

        const saveUser = async () => {
          const newUser = new UserModel(userData);
          await newUser.save();
          bot.sendMessage(
            chatId,
            "Pendaftaran berhasil! Terima kasih telah mendaftar."
          );
        };

        const cancelRegistration = () => {
          bot.sendMessage(chatId, "Pendaftaran dibatalkan.");
          step = 0;
          userData = {};
        };

        askName();

        bot.on("message", async (msg) => {
          if (msg.text === "/cancel") {
            cancelRegistration();
            return;
          }

          switch (step) {
            case 0:
              userData.name = msg.text;
              askEmail();
              step++;
              break;
            case 1:
              userData.email = msg.text;
              askPassword();
              step++;
              break;
            case 2:
              userData.password = msg.text;
              await saveUser();
              step = 0;
              userData = {};
              break;
          }
        });
      });

      await Switch(data, bot);
      res.status(200).json({ data: botData });
    } catch (error) {
      res.status(500).json({ message: "Bot Gagal di Indentifikasi" });
    }
  },
};
