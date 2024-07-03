const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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
          await UserModel.collection.drop();
          console.log("Database lama berhasil dihapus");
        } catch (error) {
          console.error("Gagal menghapus database lama:", error);
          rl.close();
          return;
        }
      }

      const users = [
        {
          name: "Wicak Bayu",
          username: "wicaksu",
          whatsapp: "082244456708",
          password: await bcrypt.hash("Jack03061997", 10),
          role: "admin",
          permission: { read: true, write: true },
          photo:
            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg",
        },
        {
          name: "User Wicaksu",
          username: "user",
          whatsapp: "081234567891",
          password: await bcrypt.hash("Jack03061997", 10),
          role: "user",
          permission: { read: true, write: false },
        },
      ];

      try {
        await UserModel.insertMany(users);
        console.log("Migrasi user berhasil");
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
