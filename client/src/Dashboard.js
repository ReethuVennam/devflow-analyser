import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [languages, setLanguages] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingLang, setLoadingLang] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 10;

  // Fetch user + repos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setUser(userData);

        const reposRes = await fetch(`http://localhost:4000/api/repos?token=${token}`);
        const reposData = await reposRes.json();
        setRepos(reposData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Fetch commits + language data
  const handleRepoClick = async (repo) => {
    setSelectedRepo(repo);
    setLoadingCommits(true);
    setLoadingLang(true);
    setCommits([]);
    setLanguages({});

    try {
      const [commitRes, langRes] = await Promise.all([
        fetch(
          `http://localhost:4000/api/commits?token=${token}&owner=${repo.owner.login}&repo=${repo.name}`
        ),
        fetch(
          `http://localhost:4000/api/languages?token=${token}&owner=${repo.owner.login}&repo=${repo.name}`
        ),
      ]);

      const commitData = await commitRes.json();
      const langData = await langRes.json();

      setCommits(commitData);
      setLanguages(langData);
    } catch (err) {
      console.error("Error fetching repo data:", err);
    } finally {
      setLoadingCommits(false);
      setLoadingLang(false);
    }
  };

  // Commit chart
  const getCommitChartData = () => {
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
          backgroundColor: "#9ab6ff",
        },
      ],
    };
  };

  // Language chart
  const getLanguageChartData = () => {
    const labels = Object.keys(languages);
    const values = Object.values(languages);
    const colors = [
      "#f4d03f",
      "#5dade2",
      "#58d68d",
      "#e74c3c",
      "#a569bd",
      "#f39c12",
      "#48c9b0",
      "#af7ac5",
    ];

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  };

  // Pagination + search
  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLast = currentPage * reposPerPage;
  const indexOfFirst = indexOfLast - reposPerPage;
  const currentRepos = filteredRepos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRepos.length / reposPerPage);

  if (loading)
    return (
      <div style={{ padding: "40px" }}>
        <Skeleton height={30} width={250} style={{ marginBottom: 20 }} />
        <Skeleton height={25} count={8} style={{ marginBottom: 10 }} />
      </div>
    );

  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <div className="navbar">
        <h1>GitHub Commit Viewer</h1>
        <div className="nav-right">
          {user && (
            <>
              <span>{user.login}</span>
              <img src={user.avatar_url} alt="User avatar" />
            </>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="main-container">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <h2>Repositories</h2>
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          {currentRepos.map((repo) => (
            <div
              key={repo.id}
              className={`repo-item ${
                selectedRepo?.name === repo.name ? "active" : ""
              }`}
              onClick={() => handleRepoClick(repo)}
            >
              <strong>{repo.name}</strong>
              <p>⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}</p>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ← Prev
              </button>
              <span>
                Page {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </aside>

        {/* MAIN PANEL */}
        <main className="main">
          {selectedRepo ? (
            <>
              <h2>{selectedRepo.name}</h2>
              <p>{selectedRepo.description || "No description available."}</p>

              {loadingCommits ? (
                <Skeleton height={25} count={5} style={{ marginBottom: 10 }} />
              ) : (
                <>
                  <div>
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

                  <div className="chart-row">
                    {/* Commit Chart */}
                    <div className="chart-container small-chart">
                      <h3>Commit Activity</h3>
                      <Bar
                        data={getCommitChartData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            x: { ticks: { color: "#555", font: { size: 11 } } },
                            y: { ticks: { color: "#555", font: { size: 11 } } },
                          },
                        }}
                      />
                    </div>

                    {/* Language Chart */}
                    <div className="chart-container small-chart">
                      <h3>Language Breakdown</h3>
                      {loadingLang ? (
                        <Skeleton height={150} />
                      ) : Object.keys(languages).length > 0 ? (
                        <Doughnut
                          data={getLanguageChartData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "right",
                                labels: { font: { size: 12 }, color: "#444" },
                              },
                            },
                          }}
                        />
                      ) : (
                        <p>No language data available.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="empty-state">
              Select a repository from the left to view details.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
