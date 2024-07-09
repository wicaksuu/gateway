const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserAutoAbsenModel = require("../models/userAutoAbsenModel");
const UserModel = require("../models/userModel");
const connectDB = require("../config/databaseConfig");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function migrateUsers() {
  await connectDB();

  rl.question(
    "Apakah Anda ingin menghapus dan membuat ulang database lama? (yes/no): ",
    async (answer) => {
      if (answer.toLowerCase() === "yes") {
        try {
          await UserAutoAbsenModel.collection.drop();
          console.log("Database lama berhasil dihapus");
        } catch (error) {
          console.error("Gagal menghapus database lama:", error);
          rl.close();
          return;
        }
      }

      const UserAutoAbsenModels = [
        {
          chatIdTelegram: "6939373220",
          name: "NUR EKOWAHYUDI, S.E.",
          nip: "198201142014021002",
          password: "198201142014021002",
          imei: "8c7c8e731c868e84",
          latitude: "-7.54350646208995",
          longitude: "111.65470339160038",
          userAgent:
            "Dalvik/2.1.0 (Linux; U; Android 13; 22041219G Build/TP1A.220624.014)",
          url: "https://absen.madiunkab.go.id",
        },
      ];

      try {
        for (let i = 0; i < UserAutoAbsenModels.length; i++) {
          let user = await UserModel.findOne({
            nip: UserAutoAbsenModels[i].nip,
          });
          if (!user) {
            user = new UserModel({
              name: UserAutoAbsenModels[i].name,
              username: UserAutoAbsenModels[i].nip,
              password: await bcrypt.hash(UserAutoAbsenModels[i].password, 10),
              role: "user",
              permission: { read: true, write: false },
              nip: UserAutoAbsenModels[i].nip,
              chatIdTelegram: UserAutoAbsenModels[i].chatIdTelegram,
              validUntil: new Date(
                new Date().setDate(new Date().getDate() + 30)
              ), // Menambahkan validUntil 30 hari dari tanggal migrasi
            });
            await user.save();
          }
          UserAutoAbsenModels[i].user = user._id;
          await UserAutoAbsenModel.create(UserAutoAbsenModels[i]);
          console.log("Migrasi user berhasil");
        }
      } catch (error) {
        console.error("Gagal melakukan migrasi user:", error);
      } finally {
        mongoose.connection.close();
        rl.close();
      }
    }
  );
}

migrateUsers();
