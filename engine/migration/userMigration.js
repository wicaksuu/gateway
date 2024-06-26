const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const connectDB = require("../config/databaseConfig");

connectDB();

async function migrateUsers() {
  const users = [
    {
      username: "wicaksu",
      whatsapp: "082244456708",
      password: await bcrypt.hash("Jack03061997", 10),
      role: "admin",
      permission: { read: true, write: true },
    },
    {
      username: "user2",
      whatsapp: "081234567891",
      password: await bcrypt.hash("password2", 10),
      role: "user",
      permission: { read: true, write: false },
    },
  ];

  try {
    await User.insertMany(users);
    console.log("Migrasi user berhasil");
  } catch (error) {
    console.error("Gagal melakukan migrasi user:", error);
  } finally {
    mongoose.connection.close();
  }
}

migrateUsers();
