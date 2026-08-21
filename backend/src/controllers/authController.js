const authService = require("../services/authService");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Servis katmanından login işlemini çağırıyoruz
    const result = await authService.loginUser(email, password);

    res.status(200).json({
      message: "Giriş başarılı.",
      ...result,
    });
  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: "Email veya şifre hatalı.",
      });
    }

    if (error.message === "UNAUTHORIZED_ROLE") {
      return res.status(403).json({
        message: "Bu kullanıcı admin yetkisine sahip değil.",
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Sunucu hatası.",
    });
  }
};

module.exports = {
  login,
};
