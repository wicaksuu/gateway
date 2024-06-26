require("dotenv").config();
const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Koneksi ke database berhasil");
    return mongoose.connection;
  } catch (error) {
    console.error("Gagal menghubungkan ke database:", error);
    process.exit(1);
  }
}

module.exports = { connect };
