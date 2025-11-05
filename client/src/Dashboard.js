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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCommits, setLoadingCommits] = useState(false);

  useEffect(() => {
    const fetchRepos = async () => {
      const res = await fetch(`http://localhost:4000/api/repos?token=${token}`);
      const data = await res.json();
      setRepos(data);
      setLoading(false);
    };
    fetchRepos();
  }, [token]);

  const handleRepoClick = async (repo) => {
    setSelectedRepo(repo);
    setLoadingCommits(true);
    setCommits([]);
    try {
      const res = await fetch(
        `http://localhost:4000/api/commits?token=${token}&owner=${repo.owner.login}&repo=${repo.name}`
      );
      const data = await res.json();
      setCommits(data);
    } catch (err) {
      console.error("Error fetching commits:", err);
    } finally {
      setLoadingCommits(false);
    }
  };

  const getChartData = () => {
    const dateMap = {};
    commits.forEach((c) => {
      const date = new Date(c.commit.author.date).toLocaleDateString();
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
          backgroundColor: "#0078d7",
        },
      ],
    };
  };

  if (loading)
    return (
      <div className="empty-state">Loading repositories...</div>
    );

  return (
    <div className="dashboard">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <h1>Repositories</h1>
        <ul className="repo-list">
          {repos.map((repo) => (
            <li
              key={repo.id}
              className={`repo-item ${
                selectedRepo?.name === repo.name ? "active" : ""
              }`}
              onClick={() => handleRepoClick(repo)}
            >
              <strong>{repo.name}</strong>
              <p>
                ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}
              </p>
            </li>
          ))}
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        {selectedRepo ? (
          <>
            <h2>{selectedRepo.name}</h2>
            <p>{selectedRepo.description || "No description available."}</p>

            {loadingCommits ? (
              <p>Loading commits...</p>
            ) : (
              <>
                <div className="commit-list">
                  <h3>Recent Commits</h3>
                  {commits.slice(0, 5).map((commit) => (
                    <div key={commit.sha} className="commit-card">
                      <strong>{commit.commit.message}</strong>
                      <small>
                        {commit.commit.author.name} •{" "}
                        {new Date(commit.commit.author.date).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>

                <div className="chart-container">
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
          </>
        ) : (
          <div className="empty-state">
            Select a repository from the left to view commits and graph.
          </div>
        )}
      </main>
    </div>
  );
}
