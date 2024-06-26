require("dotenv").config();
const mongoose = require("mongoose");

function connectDB() {
  const url = process.env.MONGO_URI;

  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(`Database connected`);
    })
    .catch((err) => {
      console.error(`connection error: ${err.message}`);
      process.exit(1);
    });

  const dbConnection = mongoose.connection;
  dbConnection.on("error", (err) => {
    console.error(`connection error: ${err}`);
  });
}

module.exports = connectDB;
