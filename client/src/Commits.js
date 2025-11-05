// client/src/Commits.js
import React, { useEffect, useState } from "react";

export default function Commits() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const owner = params.get("owner");
  const repo = params.get("repo");

  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/commits?token=${token}&owner=${owner}&repo=${repo}`
        );
        if (!res.ok) throw new Error("Failed to fetch commits");
        const data = await res.json();
        setCommits(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && owner && repo) fetchCommits();
  }, [token, owner, repo]);

  if (loading)
    return <h2 style={{ textAlign: "center" }}>Loading commits...</h2>;

  if (error)
    return (
      <h3 style={{ textAlign: "center", color: "red" }}>
        Error: {error}
      </h3>
    );

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Recent Commits for {repo}</h1>
      {commits.length === 0 ? (
        <p>No commits found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {commits.map((commit) => (
            <li
              key={commit.sha}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                marginBottom: "10px",
                padding: "10px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <p>
                <strong>Message:</strong> {commit.commit.message}
              </p>
              <p>
                <strong>Author:</strong>{" "}
                {commit.commit.author.name} (
                {commit.commit.author.email})
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(commit.commit.author.date).toLocaleString()}
              </p>
              <a
                href={commit.html_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#0969da" }}
              >
                View on GitHub →
              </a>
            </li>
          ))}
        </ul>
      )}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          style={{
            background: "#24292e",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "8px 14px",
            cursor: "pointer",
          }}
          onClick={() => window.history.back()}
        >
          ← Back to Repositories
        </button>
      </div>
    </div>
  );
}
