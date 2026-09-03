const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const loginUser = async (email, password) => {
  const result = await pool.query(
    `
    SELECT id, email, password_hash, role
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  if (result.rows.length === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.role !== "admin") {
    throw new Error("UNAUTHORIZED_ROLE");
  }

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

// ADMIN HESAP BİLGİLERİNİ GÜNCELLE
const updateAdminAccount = async ({
  userId,
  currentPassword,
  newEmail,
  newPassword,
}) => {
  // 1. Admin kullanıcısını bul
  const result = await pool.query(
    `
    SELECT id, email, password_hash, role
    FROM users
    WHERE id = $1
    `,
    [userId],
  );

  if (result.rows.length === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  const user = result.rows[0];

  // 2. Gerçekten admin mi?
  if (user.role !== "admin") {
    throw new Error("UNAUTHORIZED_ROLE");
  }

  // 3. Mevcut şifreyi kontrol et
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password_hash,
  );

  if (!isPasswordValid) {
    throw new Error("CURRENT_PASSWORD_INVALID");
  }

  // 4. Yeni değerleri mevcut değerlerden başlat
  const updatedEmail = newEmail || user.email;
  let updatedPasswordHash = user.password_hash;

  // 5. Yeni şifre gönderilmişse hashle
  if (newPassword) {
    updatedPasswordHash = await bcrypt.hash(newPassword, 10);
  }

  // 6. E-posta başka bir admin hesabında kullanılıyor mu?
  if (newEmail && newEmail !== user.email) {
    const emailCheck = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      AND id != $2
      `,
      [newEmail, userId],
    );

    if (emailCheck.rows.length > 0) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
  }

  // 7. Veritabanını güncelle
  const updateResult = await pool.query(
    `
    UPDATE users
    SET
      email = $1,
      password_hash = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, email, role, created_at, updated_at
    `,
    [updatedEmail, updatedPasswordHash, userId],
  );

  const updatedUser = updateResult.rows[0];

  // 8. Yeni JWT oluştur
  const token = jwt.sign(
    {
      userId: updatedUser.id,
      role: updatedUser.role,
      email: updatedUser.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    },
  );

  return {
    token,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  };
};

module.exports = {
  loginUser,
  updateAdminAccount,
};
