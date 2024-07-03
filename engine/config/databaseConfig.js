require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database berhasil terkoneksi");
  } catch (error) {
    console.error("Gagal terkoneksi ke database:", error);
    process.exit(1);
  }
};

mongoose.connection.on("error", (err) => {
  console.error(`connection error: ${err}`);
});

module.exports = connectDB;
