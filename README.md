# Tic-Tac-Toe SuperEvolved 🚀

A production-ready, server-authoritative multiplayer Tic-Tac-Toe game featuring an unbeatable AI and seamless cross-platform private rooms.

## ✨ Features

- **Unbeatable AI**: 100% optimal Minimax algorithm for Moderate/Hard difficulty (Zero human win probability).
- **Multiplayer**: Server-authoritative matchmaking and private rooms using 6-digit codes.
- **Dynamic Leaderboard**: Global top 100 rankings that update in real-time as games finish worldwide (Accessible via the "Leaderboard" button).
- **Modern UI**: High-fidelity, mobile-responsive design with glassmorphism and smooth animations.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Supabase (Edge Functions & Auth/Realtime).
- **Matchmaking**: Nakama Server (Authoritative Match Handler).
- **Infrastructure**: Optimized for Vercel deployment.

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v18+)
- Supabase Account
- Nakama Server (Optional for local dev)

### 2. Installation

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Running Locally

```bash
npm run dev
```

## 📦 Deployment

### Vercel

1. Push this code to GitHub.
2. Connect your GitHub to Vercel.
3. **Important**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel Environment Variables.
4. Deploy!

## 📄 Documentation

For detailed architectural info and backend setup, see [WALKTHROUGH.md](./WALKTHROUGH.md).

Demo Preview:
<img width="1876" height="884" alt="Screenshot 2026-04-21 022159" src="https://github.com/user-attachments/assets/d007d176-9199-409e-bbc8-f8a39cb3b7c4" />
<img width="895" height="767" alt="Screenshot 2026-04-21 022222" src="https://github.com/user-attachments/assets/98d01443-4d95-4bdd-9b28-56e6f28d1d03" />

<img width="740" height="735" alt="Screenshot 2026-04-21 022236" src="https://github.com/user-attachments/assets/9638cb5a-e4c4-4e87-932d-d3f4eefce957" />

<img width="856" height="849" alt="Screenshot 2026-04-21 022244" src="https://github.com/user-attachments/assets/858b5c90-1fc3-4af8-8201-20e8a352e87e" />
<img width="1869" height="887" alt="Screenshot 2026-04-21 022210" src="https://github.com/user-attachments/assets/00b0cc9a-aadf-4242-af74-c11fc91a63cf" />




---
Developed for high-performance mobile and web gaming.
