const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const checkConnection = require("./db/checkconnnection");
const User = require("./models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const port = 8000;

app.use(bodyParser.json());

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
const ACCESS_TOKEN_EXPIRES_IN = "15m"; // short-lived
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // longer-lived

// In-memory store for refresh tokens (use Redis/DB in production)
let refreshTokens = [];

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

function generateRefreshToken(user) {
  const token = jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
  refreshTokens.push(token);
  return token;
}

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // Defensive: Input validation should be here!

  try {
    // Generate a salt and hash the password
    // The higher the saltRounds, the more secure but slower. 10-12 is common.
    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email,
      password: password,
    });

    // In a real application, you would save email and hashedPassword to a database

    res.status(201).send("User registered successfully (conceptually)");
  } catch (error) {
    let msg = null;
    if (error.name === "SequelizeValidationError") {
      msg = error.errors.map((e) => `${e.path}: ${e?.message}`);
    }

    let message = msg || error.message;
    console.error("Error during registration:", message);
    res.status(500).send("Registration failed (conceptually)");
  }
});

// LOGIN endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let obj = {
      email: user.email,
      password: user.password,
    };

    const accessToken = generateAccessToken(obj);
    const refreshToken = generateRefreshToken(obj);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Login failed (conceptually)");
  }
});

// REFRESH endpoint
app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken({
        email: user.email,
        password: user.password,
      });
      res.json({ accessToken });
    });
  } catch (error) {
    console.error("Error during refresh:", error);
    res.status(500).send("Refresh failed (conceptually)");
  }
});

// 🚫 LOGOUT (optional: remove refresh token)
app.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.sendStatus(204);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const syncDb = async () => {
  try {
    await User.sync({ force: true });
    console.log("The table for the User model was just (re)created!");
  } catch (error) {
    console.error("Failed to synchronize database:", error);
  }
};

// syncDb();
checkConnection();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
