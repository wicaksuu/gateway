const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: error,
        data: null,
      });
    }
    next();
  };
};

module.exports = validateBody;
