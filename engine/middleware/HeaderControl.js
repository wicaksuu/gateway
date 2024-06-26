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

  next();
};

module.exports = headerControl;
