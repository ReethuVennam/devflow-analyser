// client/src/Login.js
import React from "react";

export default function Login() {
  const handleLogin = () => {
    // Redirect to backend for GitHub OAuth
    window.location.href = "http://localhost:4000/login/github";
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e8ecff, #f9f9fb)",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px 60px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#4b6cb7", marginBottom: "20px" }}>
          DevFlow Analyser
        </h1>
        <p style={{ marginBottom: "30px", color: "#555" }}>
          Sign in with your GitHub account to view your repositories and insights.
        </p>
        <button
          onClick={handleLogin}
          style={{
            backgroundColor: "#4b6cb7",
            color: "white",
            border: "none",
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
        >
          Login with GitHub
        </button>
      </div>
    </div>
  );
}
