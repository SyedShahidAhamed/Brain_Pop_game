# 🧩 Daily Puzzle Logic Game

A client-first **offline puzzle game** with a GitHub-style activity heatmap, built as a capstone project for the **Bluestock Internship**.

Users solve logic puzzles, track daily progress, maintain streaks, and visualize activity using a contribution-style heatmap.

---

# 🚀 Features

### 🎮 Puzzle Gameplay

* Random puzzle generation
* Instant answer validation
* Score tracking
* Multiple puzzles per session

### 📊 Activity Heatmap

* GitHub-style contribution grid
* Tracks daily puzzle completion
* Color intensity based on performance
* Works completely offline

### 🔥 Streak System

* Tracks consecutive puzzle-solving days
* Encourages consistent play

### 📦 Offline First Architecture

* Activity stored locally using **IndexedDB**
* Data compressed with **LZ-String**
* Syncs to server when internet is available

---

# 🧠 Tech Stack

Frontend

* React
* Vite
* IndexedDB
* DayJS

Backend

* Node.js
* Express

Tools

* ESLint
* Prettier
* Jest
* React Testing Library

---

# 📁 Project Structure

src
│
├── components
│   ├── HeatmapCell.jsx
│   ├── HeatmapGrid.jsx
│   ├── HeatmapContainer.jsx
│   ├── PuzzleCard.jsx
│   ├── PuzzleInput.jsx
│   ├── ScoreBoard.jsx
│   └── StreakCounter.jsx
│
├── pages
│   └── Home.jsx
│
├── db
│   └── indexedDB.js
│
├── services
│   ├── syncService.js
│   └── server.js
│
├── utils
│   └── puzzleGenerator.js
│
└── tests

---

# ⚙️ Installation

Clone the repository

```
git clone <repo-url>
```

Install dependencies

```
npm install
```

---

# ▶️ Running the Project

Start frontend

```
npm run dev
```

Runs at

```
http://localhost:5173
```

Start backend API

```
node services/server.js
```

Runs at

```
http://localhost:5000
```

---

# 🧪 Run Tests

```
npm run test
```

---

# 📦 Production Build

```
npm run build
```

Output will be in

```
dist/
```

---

# 📊 Performance

| Metric                 | Result |
| ---------------------- | ------ |
| Initial Load           | <100KB |
| Offline Support        | ✅      |
| Heatmap Rendering      | <100ms |
| Client-side Generation | <100ms |

---
# 🏗 Architecture

This project follows a **client-first architecture** where most logic runs locally for performance and offline support.


          +----------------------+
          |      React App       |
          |  (Puzzle Interface)  |
          +----------+-----------+
                     |
                     |
                     v
          +----------------------+
          |   Puzzle Generator   |
          |   (Client-side)      |
          +----------+-----------+
                     |
                     |
                     v
          +----------------------+
          |     IndexedDB        |
          |  (Local Storage)     |
          |  dailyActivity store |
          +----------+-----------+
                     |
           Offline-first storage
                     |
                     v
          +----------------------+
          |  Batch Sync Service  |
          |  (every 5 puzzles)   |
          +----------+-----------+
                     |
                     |
                     v
          +----------------------+
          |   Express Backend    |
          |  /sync/daily-scores  |
          +----------+-----------+
                     |
                     v
          +----------------------+
          |    PostgreSQL DB     |
          |   (aggregated data)  |
          +----------------------+


### Key Principles

* **Client-first design**
* **Offline functionality**
* **Minimal backend writes**
* **Efficient batch syncing**
---
# 👨‍💻 Author

**Shahid Ahamed**

Bluestock Internship – Capstone Project
