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
          name: "WICAKSONO BAYU AJI, S.KOM",
          nip: "wicaksu",
          password: "Jack03061997",
          imei: "3be18a532c24ade2",
          latitude: "-7.63250691214837",
          longitude: "111.53012497313115",
          userAgent:
            "Dalvik/2.1.0 (Linux; U; Android 13; SM-G985F Build/TP1A.220624.014)",
          url: "https://absen.madiunkab.go.id",
        },
        {
          chatIdTelegram: "1",
          name: "DIDIK MUTTAKIM, S,Pd.",
          nip: "198212272024211011",
          password: "198212272024211011",
          imei: "031eed3cc76397db",
          latitude: "-7.5374",
          longitude: "111.6068",
          userAgent:
            "Dalvik/2.1.0 (Linux; U; Android 10; CPH2179 Build/QP1A.190711.020)",
          url: "https://absen.madiunkab.go.id",
        },
        {
          chatIdTelegram: "2",
          name: "HARIS YUTAFIAN, S.Pd.",
          nip: "198304192024211004",
          password: "198304192024211004",
          imei: "b19cf0f29e04399b",
          latitude: "-7.5427",
          longitude: "111.6025",
          userAgent:
            "	Dalvik/2.1.0 (Linux; U; Android 10; RMX2030 Build/QKQ1.200209.002)",
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
