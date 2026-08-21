const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // E-posta veya şifre boş gönderildiyse
  if (!email || !password) {
    return res.status(400).json({
      message: "Email ve şifre zorunludur.",
    });
  }

  // E-posta formatına uygun değilse
  if (!email.includes("@")) {
    return res.status(400).json({
      message: "Geçerli bir email adresi giriniz.",
    });
  }

  // Her şey yolundaysa bir sonraki adıma (controller'a) geç
  next();
};

module.exports = validateLogin;
