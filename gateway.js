const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

const connectDB = require("./engine/config/databaseConfig");
const responseApiFormat = require("./engine/middleware/responseApiFormat");
const headerControl = require("./engine/middleware/HeaderControl");
const apiRoutes = require("./engine/routers/router");

connectDB();

app.use(bodyParser.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .send({ status: 400, message: "Bad request, invalid JSON" });
  }
  next();
});
app.use(responseApiFormat);
app.use(headerControl);

app.use("/", apiRoutes);
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
