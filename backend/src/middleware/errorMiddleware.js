const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
  });
};

module.exports = errorMiddleware;
