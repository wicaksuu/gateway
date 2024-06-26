const mongoose = require("mongoose");
const User = require("../models/userModel");

const db = require("../config/databaseConfig");

async function migrateUsers() {
  try {
    const connection = await db.connect();
    const adminDb = connection.db.admin();

    // Cek apakah database sudah ada
    const dbList = await adminDb.listDatabases();
    const dbExists = dbList.databases.some(
      (database) => database.name === process.env.DB_NAME
    );

    if (!dbExists) {
      console.log("Database tidak ditemukan. Membuat database baru...");
      await connection.createCollection("users");
    } else {
      console.log("Database sudah ada. Melanjutkan migrasi...");
    }

    // Define the users to be migrated
    const users = [
      {
        username: "wicaksu",
        whatsapp: "082244456708",
        password: "Jack03061997",
        role: "admin",
        permission: { read: true, write: true },
      },
      {
        username: "user2",
        whatsapp: "0987654321",
        password: "password2",
        role: "user",
        permission: { read: true, write: false },
      },
    ];

    // Migrate the users
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    console.log("User migration completed successfully.");
  } catch (error) {
    console.error("Error during user migration:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
  }
}

migrateUsers();
