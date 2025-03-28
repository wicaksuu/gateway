const mongoose = require("mongoose");
const TelegramBotModel = require("../models/telegramBotModel");
const connectDB = require("../config/databaseConfig");
const readline = require("readline");
const axios = require("axios");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function migrateTelegramBots() {
  await connectDB();

  rl.question(
    "Apakah Anda ingin menghapus dan membuat ulang database lama? (yes/no): ",
    async (answer) => {
      if (answer.toLowerCase() === "yes") {
        try {
          await TelegramBotModel.collection.drop();
          console.log("Database lama berhasil dihapus");
        } catch (error) {
          console.error("Gagal menghapus database lama:", error);
          rl.close();
          return;
        }
      }

      const telegramBots = [
        {
          name: "Bot Wicaksu",
          username: "@tuyul_wicakbot",
          token: "1240654937:AAHuoyXeFjhqddS3Ie1OwhanLzzHDulhdEY",
          deskripsi: "Bot ini digunakan untuk mengirim pesan.",
          isActive: true,
        },
        {
          name: "Bot Auto Absen",
          username: "@my_absen_online_bot",
          token: "6723275259:AAEuLPp-CvYQSioGZjvpqJ4rLyAP6b8vT80",
          deskripsi: "Bot ini digunakan untuk mempermudah presensi.",
          isActive: true,
        },
      ];

      try {
        await TelegramBotModel.insertMany(telegramBots);

        const allBots = await TelegramBotModel.find();
        for (const bot of allBots) {
          const response = await axios.get(
            `https://api.telegram.org/bot${bot.token}/setWebhook?url=https://telegram.madiunkab.go.id?bot=${bot._id}`
          );
          console.log(`Webhook untuk ${bot.name} berhasil diatur`);
        }
      } catch (error) {
        console.error("Gagal melakukan migrasi telegram bot:", error);
      } finally {
        mongoose.connection.close();
        rl.close();
      }
    }
  );
}

migrateTelegramBots();
