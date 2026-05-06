# 🧩 Daily Puzzle Logic Game

![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-Build-purple)
![Node](https://img.shields.io/badge/Node.js-Backend-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

A **client-first offline puzzle game** that challenges users with logic puzzles while tracking daily progress through a **GitHub-style contribution heatmap**.

Built as a **Capstone Project for the Bluestock Internship**, the application emphasizes **offline-first architecture, performance, and efficient client-side computation**.

---

# 🎮 Demo

![Image](https://github.com/user-attachments/assets/da6feefd-42d6-4b99-a7c1-5d77fd3d3e90)

---

# 🌐 Live Demo

[https://daily-puzzle-game-alpha-rose.vercel.app/](https://daily-puzzle-game-alpha-rose.vercel.app/)

---

# 🚀 Features

## 🎮 Puzzle Gameplay

* Random puzzle generation
* Instant answer validation
* Score tracking
* Multiple puzzles per session
* Lightweight client-side logic


## 📊 Activity Heatmap

Inspired by GitHub contribution graphs.

* Tracks daily puzzle completion
* Visual contribution grid
* Color intensity based on activity
* Fully functional offline


## 🔥 Streak System

Encourages consistent play.

* Tracks consecutive puzzle-solving days
* Updates automatically based on activity
* Stored locally for persistence


## 📦 Offline-First Architecture

The game is designed to work **even without internet connectivity**.

* Activity stored locally using **IndexedDB**
* Data compressed with **LZ-String**
* Automatic server sync when internet is available
* Efficient batch syncing to minimize API calls

---

# 🧠 Tech Stack

## Frontend

* React
* Vite
* IndexedDB
* DayJS


## Backend

* Node.js
* Express


## Development Tools

* ESLint
* Prettier
* Jest
* React Testing Library

---

# 🏗 Architecture

This project follows a **client-first architecture** where most logic runs locally to ensure **fast performance and offline functionality**.

```
+----------------------+
|      React App       |
|  (Puzzle Interface)  |
+----------+-----------+
           |
           v
+----------------------+
|   Puzzle Generator   |
|   (Client-side)      |
+----------+-----------+
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
           v
+----------------------+
|   Express Backend    |
|  /sync/daily-scores  |
+----------------------+
```

### Key Principles

* Client-first design
* Offline functionality
* Minimal backend writes
* Efficient batch syncing

---

# 📁 Project Structure

```
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
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone <repo-url>
```

Navigate to the project folder

```bash
cd daily-puzzle-game
```

Install dependencies

```bash
npm install
```

---

# ▶️ Running the Project

## Start Frontend

```bash
npm run dev
```

Runs at:

```
http://localhost:5173
```

---

## Start Backend API

```bash
node server.js
```

Runs at:

```
http://localhost:5000
```

---

# 🧪 Run Tests

```bash
npm run test
```

Testing includes:

* Component testing
* Puzzle logic validation
* UI interaction tests

---

# 📦 Production Build

Create optimized production build.

```bash
npm run build
```

Build output will be generated in:

```
dist/
```

---

# 📊 Performance

| Metric                 | Result    |
| ---------------------- | --------- |
| Initial Load           | <100KB    |
| Puzzle Generation      | <100ms    |
| Heatmap Rendering      | <100ms    |
| Offline Support        | ✅         |
| Client-side Processing | Optimized |

---

# 📸 Screenshots

### Puzzle Interface

<img width="1919" height="912" alt="Image" src="https://github.com/user-attachments/assets/fd9c8365-40b6-4d68-bed3-69357600762b" />

### Activity Heatmap

<img width="935" height="377" alt="Image" src="https://github.com/user-attachments/assets/5524924d-fee8-40a9-8447-2974a4236946" />

---

# 👨‍💻 Author

**Syed Shahid Ahamed**

Bluestock Internship – Capstone Project

GitHub:
[https://github.com/SyedShahidAhamed](https://github.com/SyedShahidAhamed)
