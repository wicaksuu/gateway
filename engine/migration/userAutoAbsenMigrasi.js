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
          chatIdTelegram: "6609241392",
          name: "GUSTI ALIFFIAN PUTRA RAMADHAN, A.Md.Kep",
          nip: "199601262024211011",
          password: "199601262024211011",
          imei: "D7B44EF9-CA4D-474E-9DF1-0EAACDEB2127",
          latitude: "-7.7437404355231685",
          longitude: "111.53006751265202",
          userAgent: "BAKTI%20Absensi/2 CFNetwork/1494.0.7 Darwin/23.4.0",
          url: "https://absen.madiunkab.go.id",
          validUntil: new Date(new Date().setDate(new Date().getDate() + 30)),
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
