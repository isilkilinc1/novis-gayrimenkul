const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const loginUser = async (email, password) => {
  // 1. Kullanıcıyı veritabanından ara
  const result = await pool.query(
    `
    SELECT id, email, password_hash, role
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  // Kullanıcı bulunamadıysa
  if (result.rows.length === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = result.rows[0];

  // 2. Şifreyi bcrypt ile karşılaştır
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // 3. Rol kontrolü (sadece admin girebilir)
  if (user.role !== "admin") {
    throw new Error("UNAUTHORIZED_ROLE");
  }

  // 4. JWT (Giriş Kartı/Token) oluştur
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = {
  loginUser,
};
