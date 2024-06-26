const responseApiFormat = (req, res, next) => {
  const originalSend = res.send;

  res.send = (body) => {
    let bodyParsed;
    try {
      bodyParsed = JSON.parse(body);
    } catch (error) {
      bodyParsed = { message: body, data: null };
    }
    const isSuccess = res.statusCode === 200;
    const responseFormat = {
      success: isSuccess,
      statusCode: res.statusCode,
      message: isSuccess ? "data get succesfully" : bodyParsed.message,
      data: bodyParsed.data,
    };
    if (process.env.LEVEL === "development") {
      responseFormat.error = bodyParsed.error;
    }
    res.status(200);
    originalSend.call(res, JSON.stringify(responseFormat));
  };

  next();
};

module.exports = responseApiFormat;
