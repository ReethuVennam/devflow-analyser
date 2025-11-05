import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

// 🌍 Configure CORS dynamically (works for localhost + deployed frontend)
const allowedOrigins = [
  "http://localhost:3000", // local React app
  "https://devflow-analyser.vercel.app" // deployed frontend (update if your domain changes)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS policy does not allow this origin"), false);
    },
  })
);

// ✅ ENV Variables
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const PORT = process.env.PORT || 4000;

// 🟢 1. GitHub Login Redirect
app.get("/login/github", (req, res) => {
  const redirectUri = `${req.protocol}://${req.get("host")}/github/callback`;
  const scope = "read:user repo";
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
  res.redirect(githubAuthUrl);
});

// 🟢 2. GitHub OAuth Callback (Exchange Code for Access Token)
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
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({ error: "Failed to get access token" });
    }

    // ✅ Redirect back to frontend (React app)
    const redirectUrl = `${FRONTEND_URL}/dashboard?token=${accessToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth Error:", error.message);
    res.status(500).json({ error: "OAuth token exchange failed" });
  }
});

// 🟢 3. Fetch User Repositories
app.get("/api/repos", async (req, res) => {
  const { token } = req.query;
  try {
    const response = await axios.get("https://api.github.com/user/repos?per_page=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching repositories:", error.message);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// 🟢 4. Fetch Commits for a Repository
app.get("/api/commits", async (req, res) => {
  const { token, owner, repo } = req.query;
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching commits:", error.message);
    res.status(500).json({ error: "Failed to fetch commits" });
  }
});

// 🟢 5. Fetch Language Breakdown for a Repository
app.get("/api/languages", async (req, res) => {
  const { token, owner, repo } = req.query;
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching languages:", error.message);
    res.status(500).json({ error: "Failed to fetch languages" });
  }
});

// 🟢 6. Fetch Pull Requests for a Repository
app.get("/api/pulls", async (req, res) => {
  const { token, owner, repo } = req.query;
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching pull requests:", error.message);
    res.status(500).json({ error: "Failed to fetch pull requests" });
  }
});

// 🟢 7. Fetch Contributors for a Repository
app.get("/api/contributors", async (req, res) => {
  const { token, owner, repo } = req.query;
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching contributors:", error.message);
    res.status(500).json({ error: "Failed to fetch contributors" });
  }
});

// 🩺 Health check route
app.get("/", (req, res) => {
  res.send("✅ DevFlow Analyser API is running successfully!");
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
