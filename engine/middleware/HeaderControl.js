const headerControl = (req, res, next) => {
  const requestBody = req.body;
  const requestPath = req.path;
  const requestMethod = req.method;
  const microServiceToken =
    req.headers[
      (process.env.MICRO_SERVICE_HEADER || "X-Microservice-Token").toLowerCase()
    ];

  if (requestPath != "/") {
    res.status(400).json({
      messages: {
        error: requestPath,
        errorMessage: "Bad Request",
      },
    });
  }
  console.log("Request Method:", requestMethod);
  console.log("Request Body:", requestBody);
  console.log("Request Path:", requestPath);

  next();
};

module.exports = headerControl;
