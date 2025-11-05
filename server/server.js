// server/server.js

const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Root route — simple health check
app.get("/", (req, res) => {
  res.send("GitHub Commit Viewer Backend Running 🚀");
});


// ✅ Step 1: Redirect user to GitHub OAuth login
app.get("/auth/github", (req, res) => {
  const redirect_uri = "http://localhost:4000/auth/github/callback";
  const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}&scope=repo,user`;
  res.redirect(authorizeUrl);
});


// ✅ Step 2: GitHub callback — exchange code for access token
app.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const access_token = tokenResponse.data.access_token;

    if (!access_token) {
      return res.status(400).send("No access token received from GitHub");
    }

    // Redirect user to frontend dashboard with token in URL
    res.redirect(`http://localhost:3000/dashboard?token=${access_token}`);
  } catch (error) {
    console.error("OAuth Error:", error.message);
    res.status(500).send("Error during GitHub authentication");
  }
});


// ✅ Step 3: Fetch user's repositories using their access token
app.get("/api/repos", async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send("Missing token");
  }

  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching repositories:", error.message);
    res.status(500).send("Failed to fetch repositories from GitHub");
  }
});


// ✅ Step 4: Optional — fetch commits of a repo (you’ll use this next)
app.get("/api/commits", async (req, res) => {
  const { token, owner, repo } = req.query;

  if (!token || !owner || !repo) {
    return res.status(400).send("Missing required query parameters");
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching commits:", error.message);
    res.status(500).send("Failed to fetch commits from GitHub");
  }
});


// ✅ Step 5: Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
