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
  const [pulls, setPulls] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [activeTab, setActiveTab] = useState("commits");

  const [loading, setLoading] = useState(true);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingLang, setLoadingLang] = useState(false);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [loadingContrib, setLoadingContrib] = useState(false);

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

  // Fetch repo details
  const handleRepoClick = async (repo) => {
    setSelectedRepo(repo);
    setActiveTab("commits");
    setLoadingCommits(true);
    setLoadingLang(true);
    setLoadingPRs(true);
    setLoadingContrib(true);
    setCommits([]);
    setLanguages({});
    setPulls([]);
    setContributors([]);

    try {
      const [commitRes, langRes, pullRes, contribRes] = await Promise.all([
        fetch(`http://localhost:4000/api/commits?token=${token}&owner=${repo.owner.login}&repo=${repo.name}`),
        fetch(`http://localhost:4000/api/languages?token=${token}&owner=${repo.owner.login}&repo=${repo.name}`),
        fetch(`http://localhost:4000/api/pulls?token=${token}&owner=${repo.owner.login}&repo=${repo.name}`),
        fetch(`http://localhost:4000/api/contributors?token=${token}&owner=${repo.owner.login}&repo=${repo.name}`),
      ]);

      const commitData = await commitRes.json();
      const langData = await langRes.json();
      const pullData = await pullRes.json();
      const contribData = await contribRes.json();

      setCommits(commitData);
      setLanguages(langData);
      setPulls(pullData);
      setContributors(contribData);
    } catch (err) {
      console.error("Error fetching repo data:", err);
    } finally {
      setLoadingCommits(false);
      setLoadingLang(false);
      setLoadingPRs(false);
      setLoadingContrib(false);
    }
  };

  // Chart data
  const getCommitChartData = () => {
    const dateMap = {};
    commits.forEach((c) => {
      const date = new Date(c.commit.author.date).toLocaleDateString();
      dateMap[date] = (dateMap[date] || 0) + 1;
    });
    const labels = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
    const values = labels.map((d) => dateMap[d]);
    return { labels, datasets: [{ label: "Commits per Day", data: values, backgroundColor: "#9ab6ff" }] };
  };

  const getLanguageChartData = () => {
    const labels = Object.keys(languages);
    const values = Object.values(languages);
    const colors = ["#f4d03f", "#5dade2", "#58d68d", "#e74c3c", "#a569bd", "#f39c12", "#48c9b0", "#af7ac5"];
    return { labels, datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderWidth: 1 }] };
  };

  // Pagination Logic
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

      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2>Repositories</h2>
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {currentRepos.map((repo) => (
            <div
              key={repo.id}
              className={`repo-item ${selectedRepo?.name === repo.name ? "active" : ""}`}
              onClick={() => handleRepoClick(repo)}
            >
              <strong>{repo.name}</strong>
              <p>⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}</p>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                ← Prev
              </button>
              <span>
                Page {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="main">
          {selectedRepo ? (
            <>
              <h2>{selectedRepo.name}</h2>
              <p>{selectedRepo.description || "No description available."}</p>

              {/* Tabs */}
              <div className="tab-row">
                <button className={activeTab === "commits" ? "active" : ""} onClick={() => setActiveTab("commits")}>
                  Commits
                </button>
                <button className={activeTab === "pulls" ? "active" : ""} onClick={() => setActiveTab("pulls")}>
                  Pull Requests
                </button>
                <button className={activeTab === "contributors" ? "active" : ""} onClick={() => setActiveTab("contributors")}>
                  Contributors
                </button>
              </div>

              {/* Commits Tab */}
              {activeTab === "commits" && (
                <>
                  {loadingCommits ? (
                    <Skeleton height={25} count={5} />
                  ) : commits.length > 0 ? (
                    <>
                      {commits.slice(0, 10).map((commit) => (
                        <div key={commit.sha} className="commit-card">
                          <strong>{commit.commit.message}</strong>
                          <small>
                            {commit.commit.author.name} •{" "}
                            {new Date(commit.commit.author.date).toLocaleString()}
                          </small>
                        </div>
                      ))}
                      <div className="chart-container small-chart">
                        <h3>Commit Activity</h3>
                        <Bar data={getCommitChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                      <div className="chart-container small-chart">
                        <h3>Language Breakdown</h3>
                        {loadingLang ? <Skeleton height={150} /> : <Doughnut data={getLanguageChartData()} />}
                      </div>
                    </>
                  ) : (
                    <p>No commits found.</p>
                  )}
                </>
              )}

              {/* Pull Requests Tab */}
{activeTab === "pulls" && (
  <>
    {loadingPRs ? (
      <Skeleton height={25} count={5} />
    ) : pulls.length > 0 ? (
      <div className="pull-requests-section">
        <h3>Pull Requests 🧩</h3>

        {/* ✅ Pull Request Summary Boxes */}
        <div className="pr-summary-grid">
          <div className="pr-box open">
            <h4>🟢 Open</h4>
            <p>{pulls.filter((pr) => pr.state === "open").length}</p>
          </div>
          <div className="pr-box merged">
            <h4>🟣 Merged</h4>
            <p>{pulls.filter((pr) => pr.merged_at).length}</p>
          </div>
          <div className="pr-box closed">
            <h4>🔴 Closed</h4>
            <p>
              {
                pulls.filter(
                  (pr) => pr.state === "closed" && !pr.merged_at
                ).length
              }
            </p>
          </div>
          <div className="pr-box avg">
            <h4>⏱️ Avg Merge Time</h4>
            <p>
              {(() => {
                const merged = pulls.filter((pr) => pr.merged_at);
                if (merged.length === 0) return "–";
                const avg =
                  merged.reduce((acc, pr) => {
                    const created = new Date(pr.created_at);
                    const mergedAt = new Date(pr.merged_at);
                    return acc + (mergedAt - created);
                  }, 0) /
                  merged.length /
                  (1000 * 60 * 60 * 24);
                return `${avg.toFixed(1)} days`;
              })()}
            </p>
          </div>
        </div>

        {/* ✅ Pull Request Cards */}
        {pulls.map((pr) => (
          <div key={pr.number} className="pr-card">
            <div className="pr-header">
              <a
                href={pr.html_url}
                target="_blank"
                rel="noreferrer"
                className="pr-title"
              >
                #{pr.number} — {pr.title}
              </a>
              <span
                className={`pr-status ${
                  pr.merged_at
                    ? "merged"
                    : pr.state === "closed"
                    ? "closed"
                    : "open"
                }`}
              >
                {pr.merged_at
                  ? "🟣 Merged"
                  : pr.state === "closed"
                  ? "🔴 Closed"
                  : "🟢 Open"}
              </span>
            </div>

            <div className="pr-meta">
              <div className="pr-author">
                <img
                  src={pr.user.avatar_url}
                  alt={pr.user.login}
                  className="pr-avatar"
                />
                <a
                  href={pr.user.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="pr-author-name"
                >
                  {pr.user.login}
                </a>
              </div>
              <small>
                Created: {new Date(pr.created_at).toLocaleDateString()} • Updated:{" "}
                {new Date(pr.updated_at).toLocaleDateString()}
              </small>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p>No pull requests found.</p>
    )}
  </>
)}


              {/* Contributors Tab */}
              {activeTab === "contributors" && (
                <>
                  {loadingContrib ? (
                    <Skeleton height={25} count={5} />
                  ) : contributors.length > 0 ? (
                    <div className="contributors-section">
                      <h3>Top Contributors 👥</h3>
                      <div className="contributors-list">
                        {contributors.map((c, i) => {
                          const total = contributors.reduce((acc, cur) => acc + cur.contributions, 0);
                          const percent = ((c.contributions / total) * 100).toFixed(1);
                          return (
                            <div key={c.login} className="contributor-card">
                              <div className="contributor-info">
                                <img src={c.avatar_url} alt={c.login} className="avatar" />
                                <div>
                                  <a href={c.html_url} target="_blank" rel="noreferrer" className="contributor-name">
                                    {i + 1}. {c.login}
                                  </a>
                                  <p>{c.contributions} commits ({percent}%)</p>
                                </div>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="chart-container contributor-chart">
                        <Bar
                          data={{
                            labels: contributors.slice(0, 8).map((c) => c.login),
                            datasets: [
                              {
                                label: "Commits",
                                data: contributors.slice(0, 8).map((c) => c.contributions),
                                backgroundColor: "#74b9ff",
                              },
                            ],
                          }}
                          options={{ indexAxis: "y", responsive: true }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p>No contributor data available.</p>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="empty-state">Select a repository from the left to view details.</div>
          )}
        </main>
      </div>
    </div>
  );
}
