const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

const db = require("./engine/config/databaseConfig");
const responseApiFormat = require("./engine/middleware/responseApiFormat");
const headerControl = require("./engine/middleware/HeaderControl");
const apiRoutes = require("./engine/routers/router");

app.use(bodyParser.json());
app.use(responseApiFormat);
app.use(headerControl);

app.use("/", apiRoutes);
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
