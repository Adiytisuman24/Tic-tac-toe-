
# Super-Evolved Tic Tac Toe: Deployment & AI Guide

This project has been upgraded with a high-performance AI, unit testing, and a Nakama-ready infrastructure.

## 🚀 Deployment Guide

### 1. Frontend Deployment (Game URL)
The fastest way to deploy the frontend is via **Vercel** or **Netlify**.

1.  **Push to GitHub**: If you haven't already, push your code to a repository.
2.  **Connect to Vercel**:
    *   Go to [vercel.com](https://vercel.com).
    *   Import your repository.
    *   Add Environment Variables (see below).
    *   Click **Deploy**.

**Mobile Responsiveness:**
*   The UI is fully responsive with flex layouts and `aspect-square` boards.
*   Added `viewport` meta tag for better mobile scaling.

## 🛡️ Server-Authoritative Logic (Nakama)
Multiplayer logic is moved from Supabase to Nakama for real-time performance and anti-cheat:
*   **State Management**: Game state (board, turns, timer) lives on the server.
*   **Validation**: Every move is checked for validity before being applied.
*   **Broadcasting**: Validated updates are broadcasted to both players instantly.
*   **Anti-Cheat**: Prevents double-moves or playing on occupied cells.

## 🏆 Leaderboard System
Nakama's built-in leaderboard tracks:
*   Wins, losses, and current win streaks.
*   Global rankings with top-tier player statistics.

## ⏱️ Timer-Based Mode
*   **Turn Limit**: 30 seconds per move.
*   **Automatic Forfeit**: Server automatically ends the match if a player times out.
*   **Matchmaking**: Supports filtering by 'classic' vs 'timed' modes.

### 2. Nakama Server Deployment (Nakama Endpoint)
Nakama is best deployed using **Docker** on a cloud provider like **Fly.io**, **Railway**, or **DigitalOcean**.

#### Deploying on Fly.io (Recommended)
1.  Install [flyctl](https://fly.io/docs/hands-on/install-flyctl/).
2.  Run `fly launch` in the project root.
3.  Use the provided `docker-compose.yml` configuration (ensure any CockroachDB setup is handled).
4.  Once deployed, your endpoint will be `https://<your-app-name>.fly.dev`.

### 3. CI/CD (GitHub Actions)
I have added a GitHub Action in `.github/workflows/ci.yml`. 
*   **Automatic Tests**: Every time you push to `main` or `master`, GitHub will run your unit tests and linting.
*   **Status Badges**: You can see the build status in your GitHub repository sidebar.

## 🤖 AI Opponent
The AI uses a **Minimax Algorithm**, which ensures it plays optimally. 
*   **Performance**: The AI is "unbeatable" (it will always win or draw).
*   **Speed**: Calculations are performed locally in the browser, providing a zero-latency experience.

## 🛠️ Local Development
To run the Nakama server locally:
```bash
docker-compose up -d
```
Then start the game:
```bash
npm run dev
```

## ✅ Test Verification
To run the included unit tests locally:
```bash
npm test
```
