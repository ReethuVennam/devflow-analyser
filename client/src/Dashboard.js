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

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                ← Prev
              </button>
              <span>
                Page {currentPage} / {totalPages}
              </span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                Next →
              </button>
            </div>
          )}
        </aside>

        {/* Main */}
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

              {/* ✅ Commits Tab */}
              {activeTab === "commits" && (
                <>
                  {loadingCommits ? (
                    <Skeleton height={25} count={5} />
                  ) : commits.length > 0 ? (
                    <div className="commits-section">
                      <h3>Commit Insights 📈</h3>
                      <div className="commit-chart-row">
                        <div className="chart-box">
                          <h4>Commit Activity</h4>
                          <Bar data={getCommitChartData()} />
                        </div>
                        <div className="chart-box">
                          <h4>Language Breakdown</h4>
                          <Doughnut data={getLanguageChartData()} />
                        </div>
                      </div>
                      <div className="recent-commits">
                        <h4>Recent Commits 🧾</h4>
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
                    </div>
                  ) : (
                    <p>No commits found.</p>
                  )}
                </>
              )}

              {/* ✅ Pull Requests Tab */}
              {activeTab === "pulls" && (
                <>
                  {loadingPRs ? (
                    <Skeleton height={25} count={5} />
                  ) : pulls.length > 0 ? (
                    pulls.map((pr) => (
                      <div key={pr.number} className="commit-card">
                        <strong>#{pr.number} — {pr.title}</strong>
                        <small>
                          👤 {pr.user.login} • {new Date(pr.created_at).toLocaleDateString()} •{" "}
                          {pr.merged_at ? "🟣 Merged" : pr.state === "closed" ? "🔴 Closed" : "🟢 Open"}
                        </small>
                      </div>
                    ))
                  ) : (
                    <p>No pull requests found.</p>
                  )}
                </>
              )}

              {/* ✅ Contributors Tab */}
              {activeTab === "contributors" && (
                <>
                  {loadingContrib ? (
                    <Skeleton height={25} count={5} />
                  ) : contributors.length > 0 ? (
                    <div className="contributors-section">
                      <h3>Top Contributors 🧑‍💻</h3>
                      <div className="contributors-list">
                        {contributors.slice(0, 8).map((c) => (
                          <div key={c.id} className="contributor-card">
                            <div className="contributor-info">
                              <img src={c.avatar_url} alt={c.login} className="avatar" />
                              <div>
                                <a
                                  href={c.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="contributor-name"
                                >
                                  {c.login}
                                </a>
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{
                                      width: `${(c.contributions /
                                        contributors[0].contributions) *
                                        100}%`,
                                    }}
                                  ></div>
                                </div>
                                <small>{c.contributions} commits</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="contributor-chart">
                        <h3>Contribution Distribution</h3>
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
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="no-contrib">
                      <p>No contributors found for this repository.</p>
                    </div>
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
