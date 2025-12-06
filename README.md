# DevFlow Analyser 🚀

A powerful web application for analyzing GitHub repositories with real-time insights, interactive visualizations, and comprehensive analytics.

## Overview

DevFlow Analyser helps developers understand their GitHub projects better by providing:
- 📊 Commit history visualization
- 📈 Code language breakdown analysis
- 👥 Contributor insights and statistics
- 🔄 Pull request tracking (open & closed)
- 📥 Multiple export formats (JSON, CSV)
- 🔐 Secure GitHub OAuth authentication

## Tech Stack

**Frontend:**
- React.js
- Chart.js for data visualization
- React Router for navigation
- File-saver & PapaParse for exports
- React Loading Skeleton for loading states

**Backend:**
- Node.js & Express.js
- GitHub REST API integration
- CORS-enabled for secure cross-origin requests
- Environment-based configuration

**Deployment:**
- Frontend: Vercel
- Backend: Render

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- GitHub OAuth App credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ReethuVennam/devflow-analyser.git
   cd devflow-analyser
   ```

2. **Setup Backend:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   FRONTEND_URL=http://localhost:3000
   PORT=4000
   ```

3. **Setup Frontend:**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the application:**
   
   Terminal 1 (Backend):
   ```bash
   cd server
   npm start
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd client
   npm start
   ```

The app will open at `http://localhost:3000`

## Features in Detail

### 🔐 GitHub Authentication
- Secure OAuth 2.0 authentication flow
- No password storage — all data handled securely by GitHub
- Access token automatically managed

### 📊 Analytics Dashboard
**Commits Tab:**
- View complete commit history
- See author names and commit dates
- Pagination support for large repositories

**Languages Tab:**
- Interactive doughnut chart
- Programming language distribution
- Percentage breakdown

**Pull Requests Tab:**
- All PRs (open and closed)
- PR title, author, and status
- Creation date tracking

**Contributors Tab:**
- List of all contributors
- Contribution count per person
- Performance insights

### 📥 Export Options
- **JSON Export** — Full repository insights
- **CSV Export** — Commit data for spreadsheets
- **Chart Downloads** — Save visualizations as PNG

### 🔗 Share & Collaborate
- Generate shareable dashboard links
- Easy team collaboration
- Copy share link to clipboard

## Project Structure

```
devflow-analyser/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Commits.js
│   │   └── index.js
│   └── package.json
├── server/
│   ├── server.js
│   └── package.json
└── README.md
```

## API Endpoints

**Backend Routes:**
- `GET /login/github` — Initiates GitHub OAuth
- `GET /github/callback` — OAuth callback handler
- `GET /api/repos` — Fetch user repositories
- `GET /api/commits` — Fetch repository commits
- `GET /api/languages` — Fetch language breakdown
- `GET /api/pulls` — Fetch pull requests
- `GET /api/contributors` — Fetch contributors

## Environment Variables

**Backend (.env):**
```
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
FRONTEND_URL=http://localhost:3000
PORT=4000
```

**Frontend (.env):**
```
REACT_APP_API_BASE=http://localhost:4000
```

## Deployment

### Deploy Frontend (Vercel)
```bash
cd client
npm run build
# Deploy build folder to Vercel
```

### Deploy Backend (Render)
```bash
# Push to GitHub and connect Render to deploy automatically
```

## Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Contact & Support

Have questions? Feel free to reach out or open an issue on GitHub!

---

**Made with ❤️ by [Reethu Vennam](https://github.com/ReethuVennam)**
