// client/src/Dashboard.js
import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [loadingCommits, setLoadingCommits] = useState(false);

  // ✅ Fetch repositories
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/repos?token=${token}`
        );
        if (!response.ok) throw new Error("Failed to load repositories");
        const data = await response.json();
        setRepos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchRepos();
  }, [token]);

  // ✅ Fetch commits when a repo is selected
  const handleViewCommits = async (repoName, ownerName) => {
    setSelectedRepo(repoName);
    setLoadingCommits(true);
    setCommits([]);

    try {
      const res = await fetch(
        `http://localhost:4000/api/commits?token=${token}&owner=${ownerName}&repo=${repoName}`
      );
      if (!res.ok) throw new Error("Failed to fetch commits");
      const data = await res.json();
      setCommits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCommits(false);
    }
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading repositories...</h2>;
  if (error) return <h3 style={{ color: "red", textAlign: "center" }}>{error}</h3>;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Your GitHub Repositories
      </h1>

      {repos.length === 0 ? (
        <p>No repositories found.</p>
      ) : (
        repos.map((repo) => (
          <div
            key={repo.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ margin: 0 }}>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none", color: "#0969da" }}
              >
                {repo.name}
              </a>
            </h2>
            <p style={{ margin: "8px 0" }}>
              {repo.description || "No description"}
            </p>
            <p style={{ color: "#555" }}>
              ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}
            </p>

            <button
              style={{
                backgroundColor: "#24292e",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
              onClick={() => handleViewCommits(repo.name, repo.owner.login)}
            >
              {selectedRepo === repo.name ? "Hide Commits" : "View Commits"}
            </button>

            {/* ✅ Show commits below the repo */}
            {selectedRepo === repo.name && (
              <div style={{ marginTop: "15px" }}>
                {loadingCommits ? (
                  <p>Loading commits...</p>
                ) : commits.length === 0 ? (
                  <p>No commits found for this repository.</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {commits.slice(0, 10).map((commit) => (
                      <li
                        key={commit.sha}
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "8px 0",
                        }}
                      >
                        <p style={{ margin: 0 }}>
                          <strong>Message:</strong> {commit.commit.message}
                        </p>
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                          {commit.commit.author.name} •{" "}
                          {new Date(commit.commit.author.date).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
