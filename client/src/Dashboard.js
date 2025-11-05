// client/src/Dashboard.js
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [loadingCommits, setLoadingCommits] = useState(false);

  // ✅ Fetch user repositories
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/repos?token=${token}`);
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

  // ✅ Fetch commits when repo selected
  const handleViewCommits = async (repoName, ownerName) => {
    if (selectedRepo === repoName) {
      setSelectedRepo(null);
      return;
    }
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

  // ✅ Generate commit frequency data for Chart.js
  const getChartData = () => {
    const dateMap = {};

    commits.forEach((commit) => {
      const date = new Date(commit.commit.author.date).toLocaleDateString();
      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    const labels = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
    const values = labels.map((d) => dateMap[d]);

    return {
      labels,
      datasets: [
        {
          label: "Commits per Day",
          data: values,
          backgroundColor: "#36a2eb",
        },
      ],
    };
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading repositories...</h2>;
  if (error) return <h3 style={{ color: "red", textAlign: "center" }}>{error}</h3>;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Your GitHub Repositories</h1>

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
            <p style={{ margin: "8px 0" }}>{repo.description || "No description"}</p>
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

            {/* ✅ Commits and Chart Section */}
            {selectedRepo === repo.name && (
              <div style={{ marginTop: "15px" }}>
                {loadingCommits ? (
                  <p>Loading commits...</p>
                ) : commits.length === 0 ? (
                  <p>No commits found.</p>
                ) : (
                  <>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {commits.slice(0, 5).map((commit) => (
                        <li
                          key={commit.sha}
                          style={{
                            borderBottom: "1px solid #eee",
                            padding: "6px 0",
                          }}
                        >
                          <strong>{commit.commit.message}</strong>
                          <br />
                          <small>
                            {commit.commit.author.name} —{" "}
                            {new Date(commit.commit.author.date).toLocaleString()}
                          </small>
                        </li>
                      ))}
                    </ul>

                    {/* Chart.js Graph */}
                    <div style={{ marginTop: "25px" }}>
                      <h3>Commit Activity</h3>
                      <Bar
                        data={getChartData()}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            title: { display: false },
                          },
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
