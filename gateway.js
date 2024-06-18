const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const db = require("./engine/config/databaseConfig");
const responseApiFormat = require("./engine/middleware/responseApiFormat");
const headerControl = require("./engine/middleware/HeaderControl");

app.use(responseApiFormat);
app.use(headerControl);
app.get("/", (req, res) => {
  res.status(200).json({
    data: {
      any: "message",
      dsa: "dsa",
    },
  });
});
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
