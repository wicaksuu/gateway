require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");

let client;

try {
  client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  console.log("Koneksi ke database berhasil");
} catch (error) {
  console.error("Gagal menghubungkan ke database:", error);
  process.exit(1);
}

module.exports = client;
