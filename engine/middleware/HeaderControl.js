const headerControl = async (req, res, next) => {
  if (req.path !== "/") {
    return res.status(400).json({
      messages: {
        error: req.path,
        errorMessage: "Permintaan Salah",
      },
    });
  }

  const { bot: botId, hook } = req.query;

  if (req.method === "POST") {
    if (botId) {
      req.body = { query: "Bot", params: { data: { ...req.body }, botId } };
    } else if (hook) {
      req.body = { query: "Webhook", params: { data: { ...req.body }, hook } };
    }
  }

  next();
};

module.exports = headerControl;
