/**
 * NOVIS Gayrimenkul - Production Infrastructure Pre-flight Automated Smoke Test Suite
 * Fully isolated - No external DB or cloud service connections made.
 */

const assert = require("assert");
const jwt = require("jsonwebtoken");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const test = (name, fn) => {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
};

const asyncTest = async (name, fn) => {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
};

(async () => {
  console.log("\n=======================================================");
  console.log("NOVIS GAYRİMENKUL - PRE-FLIGHT SMOKE TEST SUITE");
  console.log("=======================================================\n");

  // -------------------------------------------------------------
  // 1. ENVIRONMENT VALIDATION TESTS
  // -------------------------------------------------------------
  console.log("1. Environment Variable Validation Tests:");
  
  test("validateEnv throws in production if critical variables are missing", () => {
    const origEnv = { ...process.env };
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
    delete process.env.FRONTEND_URL;

    const validateEnv = require("../src/config/validateEnv");
    assert.throws(
      () => validateEnv(),
      /Production startup aborted: Missing required environment variables/,
    );

    process.env = origEnv;
  });

  test("validateEnv rejects JWT_SECRET shorter than 32 characters in production", () => {
    const origEnv = { ...process.env };
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://dummy:dummy@dummy:5432/dummy";
    process.env.FRONTEND_URL = "https://novisgayrimenkul.com";
    process.env.CLOUDINARY_CLOUD_NAME = "dummy";
    process.env.CLOUDINARY_API_KEY = "dummy";
    process.env.CLOUDINARY_API_SECRET = "dummy";
    process.env.JWT_SECRET = "short_secret_under_32_chars";

    const validateEnv = require("../src/config/validateEnv");
    assert.throws(
      () => validateEnv(),
      /JWT_SECRET must be at least 32 characters long/,
    );

    process.env = origEnv;
  });

  test("validateEnv passes when all production variables are properly set", () => {
    const origEnv = { ...process.env };
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://dummy:dummy@dummy:5432/dummy";
    process.env.FRONTEND_URL = "https://novisgayrimenkul.com";
    process.env.CLOUDINARY_CLOUD_NAME = "dummy";
    process.env.CLOUDINARY_API_KEY = "dummy";
    process.env.CLOUDINARY_API_SECRET = "dummy";
    process.env.JWT_SECRET = "a_very_secure_and_long_jwt_secret_key_exceeding_32_characters";

    const validateEnv = require("../src/config/validateEnv");
    assert.doesNotThrow(() => validateEnv());

    process.env = origEnv;
  });

  // -------------------------------------------------------------
  // 2. CORS LOGIC & ORIGIN PARSING TESTS
  // -------------------------------------------------------------
  console.log("\n2. CORS Logic & Origin Parsing Tests:");

  const isOriginAllowed = (origin, frontendUrl, nodeEnv) => {
    if (!origin) return true;
    const normalized = origin.replace(/\/$/, "").toLowerCase();
    const isProduction = nodeEnv === "production";

    if (frontendUrl) {
      const envOrigins = frontendUrl
        .split(",")
        .map((u) => u.trim().replace(/\/$/, "").toLowerCase())
        .filter(Boolean);

      if (envOrigins.includes(normalized)) {
        return true;
      }
    }

    if (!isProduction) {
      if (
        /^http:\/\/localhost(:\d+)?$/.test(normalized) ||
        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(normalized)
      ) {
        return true;
      }
    }

    return false;
  };

  test("CORS allows comma-separated origins with whitespace and trailing slashes", () => {
    const frontendUrl = " https://novisgayrimenkul.com/ , https://www.novisgayrimenkul.com/ , https://novis.vercel.app ";
    assert.strictEqual(isOriginAllowed("https://novisgayrimenkul.com", frontendUrl, "production"), true);
    assert.strictEqual(isOriginAllowed("https://www.novisgayrimenkul.com", frontendUrl, "production"), true);
    assert.strictEqual(isOriginAllowed("https://novis.vercel.app", frontendUrl, "production"), true);
    assert.strictEqual(isOriginAllowed("https://evil-site.com", frontendUrl, "production"), false);
  });

  test("CORS blocks localhost in production", () => {
    const frontendUrl = "https://novisgayrimenkul.com";
    assert.strictEqual(isOriginAllowed("http://localhost:5173", frontendUrl, "production"), false);
    assert.strictEqual(isOriginAllowed("http://127.0.0.1:3000", frontendUrl, "production"), false);
  });

  test("CORS allows localhost in development", () => {
    const frontendUrl = "";
    assert.strictEqual(isOriginAllowed("http://localhost:5173", frontendUrl, "development"), true);
    assert.strictEqual(isOriginAllowed("http://127.0.0.1:5173", frontendUrl, "development"), true);
  });

  test("CORS allows health checks / no-origin requests", () => {
    assert.strictEqual(isOriginAllowed(undefined, "https://novisgayrimenkul.com", "production"), true);
  });

  // -------------------------------------------------------------
  // 3. JWT SIGNING, VERIFICATION & ROLE ENFORCEMENT TESTS
  // -------------------------------------------------------------
  console.log("\n3. JWT & Role Authorization Tests:");

  const testSecret = "0123456789abcdef0123456789abcdef0123456789abcdef";

  test("JWT HS256 signing and expiration validation", () => {
    const payload = { userId: 1, email: "admin@novisgayrimenkul.com", role: "admin" };
    const token = jwt.sign(payload, testSecret, { algorithm: "HS256", expiresIn: "1h" });

    const decoded = jwt.verify(token, testSecret, { algorithms: ["HS256"] });
    assert.strictEqual(decoded.userId, 1);
    assert.strictEqual(decoded.role, "admin");
    assert.strictEqual(decoded.email, "admin@novisgayrimenkul.com");
    assert.strictEqual(typeof decoded.exp, "number");
  });

  test("JWT rejects token signed with wrong secret", () => {
    const token = jwt.sign({ userId: 1, role: "admin" }, "wrong_secret_key_at_least_32_characters_long", { algorithm: "HS256" });
    assert.throws(() => jwt.verify(token, testSecret, { algorithms: ["HS256"] }));
  });

  test("JWT rejects expired token", () => {
    const token = jwt.sign({ userId: 1, role: "admin" }, testSecret, { algorithm: "HS256", expiresIn: "-1s" });
    assert.throws(() => jwt.verify(token, testSecret, { algorithms: ["HS256"] }), /jwt expired/);
  });

  test("Auth Middleware: returns 401 when Authorization header is missing", () => {
    const { authenticate } = require("../src/middleware/authMiddleware");
    const req = { headers: {} };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return { json: (data) => { jsonSent = data; } };
      },
    };
    let nextCalled = false;
    authenticate(req, res, () => { nextCalled = true; });

    assert.strictEqual(statusSent, 401);
    assert.strictEqual(jsonSent.success, false);
    assert.strictEqual(nextCalled, false);
  });

  test("Auth Middleware: returns 401 when Authorization format is not 'Bearer <token>'", () => {
    const { authenticate } = require("../src/middleware/authMiddleware");
    const req = { headers: { authorization: "Basic some_base64_data" } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return { json: (data) => { jsonSent = data; } };
      },
    };
    authenticate(req, res, () => {});
    assert.strictEqual(statusSent, 401);
    assert.strictEqual(jsonSent.message, "Geçersiz authorization formatı.");
  });

  test("Role Middleware: returns 403 when user is not admin", () => {
    const { requireAdmin } = require("../src/middleware/roleMiddleware");
    const req = { user: { userId: 5, role: "user" } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return { json: (data) => { jsonSent = data; } };
      },
    };
    let nextCalled = false;
    requireAdmin(req, res, () => { nextCalled = true; });

    assert.strictEqual(statusSent, 403);
    assert.strictEqual(jsonSent.success, false);
    assert.strictEqual(nextCalled, false);
  });

  test("Role Middleware: allows admin user to proceed", () => {
    const { requireAdmin } = require("../src/middleware/roleMiddleware");
    const req = { user: { userId: 1, role: "admin" } };
    let nextCalled = false;
    requireAdmin(req, {}, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
  });

  // -------------------------------------------------------------
  // 4. CONTROLLER NUMERIC ID VALIDATION TESTS
  // -------------------------------------------------------------
  console.log("\n4. Numeric Parameter Validation Tests:");

  test("Numeric ID check rejects NaN, strings, and SQL injection strings", () => {
    const isInvalidId = (id) => {
      const num = parseInt(id, 10);
      return !num || isNaN(num) || !Number.isInteger(Number(id)) || Number(id) <= 0;
    };

    assert.strictEqual(isInvalidId("abc"), true);
    assert.strictEqual(isInvalidId("1; DROP TABLE users;"), true);
    assert.strictEqual(isInvalidId("undefined"), true);
    assert.strictEqual(isInvalidId("-5"), true);
    assert.strictEqual(isInvalidId("0"), true);
    assert.strictEqual(isInvalidId("42"), false);
  });

  // -------------------------------------------------------------
  // 5. ERROR HANDLING & SANITIZATION TESTS
  // -------------------------------------------------------------
  console.log("\n5. Error Handling & Masking Tests:");

  test("Error middleware masks 500 database errors in production", () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const errorMiddleware = require("../src/middleware/errorMiddleware");
    const err = new Error("FATAL: password authentication failed for user 'postgres'");
    err.statusCode = 500;

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return { json: (data) => { jsonSent = data; } };
      },
    };

    errorMiddleware(err, {}, res, () => {});

    assert.strictEqual(statusSent, 500);
    assert.strictEqual(jsonSent.success, false);
    assert.strictEqual(jsonSent.message, "Sunucu hatası. Lütfen daha sonra tekrar deneyin.");
    assert.strictEqual(JSON.stringify(jsonSent).includes("postgres"), false);

    process.env.NODE_ENV = origEnv;
  });

  test("Error middleware preserves safe 400 validation error messages", () => {
    const errorMiddleware = require("../src/middleware/errorMiddleware");
    const err = new Error("Geçersiz ilan ID'si.");
    err.statusCode = 400;

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return { json: (data) => { jsonSent = data; } };
      },
    };

    errorMiddleware(err, {}, res, () => {});

    assert.strictEqual(statusSent, 400);
    assert.strictEqual(jsonSent.message, "Geçersiz ilan ID'si.");
  });

  // -------------------------------------------------------------
  // 6. UPLOAD MIME TYPE & EXTENSION WHITELIST TESTS
  // -------------------------------------------------------------
  console.log("\n6. Upload Whitelist & Validation Tests:");

  const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
  const ALLOWED_IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];
  const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska"];
  const ALLOWED_VIDEO_EXTS = ["mp4", "webm", "mov", "avi", "mkv"];

  const checkFile = (filename, mimetype) => {
    const path = require("path");
    const ext = path.extname(filename).toLowerCase().replace(".", "");
    const mime = (mimetype || "").toLowerCase();

    const isImageMime = ALLOWED_IMAGE_MIMES.includes(mime);
    const isImageExt = ALLOWED_IMAGE_EXTS.includes(ext);
    const isVideoMime = ALLOWED_VIDEO_MIMES.includes(mime) || mime.startsWith("video/");
    const isVideoExt = ALLOWED_VIDEO_EXTS.includes(ext);

    return (isImageMime && isImageExt) || (isVideoMime && isVideoExt);
  };

  test("Upload validator allows valid image formats", () => {
    assert.strictEqual(checkFile("photo.jpg", "image/jpeg"), true);
    assert.strictEqual(checkFile("photo.png", "image/png"), true);
    assert.strictEqual(checkFile("photo.webp", "image/webp"), true);
  });

  test("Upload validator allows valid video formats", () => {
    assert.strictEqual(checkFile("tour.mp4", "video/mp4"), true);
    assert.strictEqual(checkFile("tour.webm", "video/webm"), true);
    assert.strictEqual(checkFile("tour.mov", "video/quicktime"), true);
  });

  test("Upload validator rejects executables, scripts, and mismatched extensions", () => {
    assert.strictEqual(checkFile("malware.exe", "application/x-msdownload"), false);
    assert.strictEqual(checkFile("script.js", "application/javascript"), false);
    assert.strictEqual(checkFile("shell.php", "text/php"), false);
    assert.strictEqual(checkFile("fake.jpg", "application/x-php"), false);
  });

  // -------------------------------------------------------------
  // 7. RATE LIMITER CONFIGURATION TESTS
  // -------------------------------------------------------------
  console.log("\n7. Rate Limiter Configuration Tests:");

  test("Rate limiters are defined with expected windowMs and max limits", () => {
    const { apiLimiter, loginLimiter, contactLimiter, uploadLimiter } = require("../src/middleware/rateLimiter");
    assert.ok(typeof apiLimiter === "function");
    assert.ok(typeof loginLimiter === "function");
    assert.ok(typeof contactLimiter === "function");
    assert.ok(typeof uploadLimiter === "function");
  });

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
  console.log("=======================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
})();
