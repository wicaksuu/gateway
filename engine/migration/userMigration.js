const mongoose = require("mongoose");
const User = require("../models/userModel");

const migrateUsers = async () => {
  try {
    // Connect to the database
    await mongoose.connect("mongodb://localhost:27017/yourDatabase", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

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
};

migrateUsers();
