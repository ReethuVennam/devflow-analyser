import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// ✅ Route 1: GitHub OAuth Redirect
app.get("/login/github", (req, res) => {
  const redirectUri = "http://localhost:4000/github/callback";
  const scope = "read:user repo";
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
  res.redirect(githubAuthUrl);
});

// ✅ Route 2: GitHub OAuth Callback
app.get("/github/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ error: "Failed to get access token" });
    }

    res.redirect(`http://localhost:3000/dashboard?token=${accessToken}`);
  } catch (error) {
    console.error("OAuth error:", error.message);
    res.status(500).json({ error: "OAuth token exchange failed" });
  }
});

// ✅ Route 3: Fetch Repositories
app.get("/api/repos", async (req, res) => {
  const { token } = req.query;
  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching repositories:", error.message);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// ✅ Route 4: Fetch Commits
app.get("/api/commits", async (req, res) => {
  const { token, owner, repo } = req.query;
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching commits:", error.message);
    res.status(500).json({ error: "Failed to fetch commits" });
  }
});

// ✅ Route 5: Fetch Languages
app.get("/api/languages", async (req, res) => {
  const { token, owner, repo } = req.query;
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching languages:", error.message);
    res.status(500).json({ error: "Failed to fetch languages" });
  }
});

// ✅ Route 6: Fetch Pull Requests
app.get("/api/pulls", async (req, res) => {
  const { token, owner, repo } = req.query;
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching pull requests:", error.message);
    res.status(500).json({ error: "Failed to fetch pull requests" });
  }
});

// ✅ Route 7: Enhanced Contributors
app.get("/api/contributors", async (req, res) => {
  const { token, owner, repo } = req.query;
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contributors`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const sorted = response.data
      .map((c) => ({
        login: c.login,
        avatar_url: c.avatar_url,
        html_url: c.html_url,
        contributions: c.contributions,
      }))
      .sort((a, b) => b.contributions - a.contributions);

    res.json(sorted);
  } catch (error) {
    console.error("Error fetching contributors:", error.message);
    res.status(500).json({ error: "Failed to fetch contributors" });
  }
});

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("✅ GitHub Analytics Server is running successfully!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
