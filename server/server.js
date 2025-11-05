// server/server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());

app.get("/", (_req, res) => res.send("Backend OK 🚀"));

// 1) send user to GitHub OAuth
app.get("/auth/github", (req, res) => {
  const redirect_uri = "http://localhost:4000/auth/github/callback";
  const authorizeURL =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
    `&scope=repo%20user`;
  res.redirect(authorizeURL);
});

// 2) GitHub redirects back here → exchange code for token → send token to frontend
app.get("/auth/github/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );
    const access_token = tokenRes.data.access_token;
    if (!access_token) return res.status(400).send("No token from GitHub");

    // redirect to frontend with token in URL (simple for now)
    res.redirect(`http://localhost:3000/dashboard?token=${access_token}`);
  } catch (e) {
    console.error("OAuth error:", e?.response?.data || e.message);
    res.status(500).send("OAuth failed");
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
