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
          chatIdTelegram: "489811594",
          name: "PENTALIANAWATI, S.E.,M.Si",
          nip: "197603212003122004",
          password: "197603212003122004",
          imei: "48ca1b4e277eca0b",
          latitude: "-7.547674426309224",
          longitude: "111.65463746058549",
          userAgent:
            "Dalvik/2.1.0 (Linux; U; Android 10; SM-G975F Build/QP1A.190711.020)",
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
