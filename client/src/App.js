// client/src/App.js
import React from "react";
import Dashboard from "./Dashboard";

function App() {
  const path = window.location.pathname;

  const handleLogin = () => {
    window.location.href = "http://localhost:4000/auth/github";
  };

  if (path.startsWith("/dashboard")) return <Dashboard />;

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ fontWeight: "bold" }}>GitHub Commit Viewer</h1>
      <button
        onClick={handleLogin}
        style={{
          backgroundColor: "#24292e",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Login with GitHub
      </button>
    </div>
  );
}

export default App;
