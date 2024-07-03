const headerControl = async (req, res, next) => {
  if (req.path !== "/") {
    return res.status(400).json({
      messages: {
        error: req.path,
        errorMessage: "Permintaan Salah",
      },
    });
  }

  const botId = req.query.bot;
  if (botId && req.method === "POST") {
    const originalBody = { ...req.body };
    req.body = { query: "Bot", params: { data: originalBody, botId: botId } };
  }

  next();
};

module.exports = headerControl;
