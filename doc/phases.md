# Project Phases

## 🎯 PHASE 1: FOUNDATION (Weeks 1-2)
### Week 1: Python DPI Collector Setup
- **Goal:** Set up a Python environment and implement the core DPI capture engine.
- **Key Task:** Capture and export flows to JSON, filter out noise (broadcast/multicast).

### Week 2: Database & Storage Layer
- **Goal:** Provide a robust data storage for flow data using MySQL 8.0.
- **Key Task:** Design and create database schema `office_dpi`, create connector for Python python-mysql, write integration logic.

## 📊 PHASE 2: API DEVELOPMENT (Weeks 3-4)
### Week 3: Node.js/Express Backend API
- **Goal:** Stand up an Express server interacting with the MySQL database.
- **Key Task:** Build database connection pool, implement core REST endpoints (`/api/flows/latest`, `/api/stats/top-apps`, etc.).

### Week 4: Advanced API Features
- **Goal:** Enable user tracking, analytics logic, and implement secure data transfer.
- **Key Task:** CSV upload endpoints for employee mapping, auth, web sockets, daily job creation.

## 🎨 PHASE 3: FRONTEND DEVELOPMENT (Weeks 5-6)
### Week 5: React + Vite Setup & Basic Components
- **Goal:** Build UI skeleton for DPI monitoring dashboard.
- **Key Task:** Initialize Vite+React project, setup Material UI, Recharts, basic dashboard logic.

### Week 6: Charts & Advanced Features
- **Goal:** Visually demonstrate insights derived from DPI.
- **Key Task:** Pie charts, line-series, top talkers bar chart, date range picker.

## 🚀 PHASE 4: OFFICE FEATURES & POLISH (Week 7-8)
### Week 7: Office-Specific Features
- **Goal:** Tailor monitoring insights to specific organization structures.
- **Key Task:** Employee-IP mapping from CSV, department filtering, hour reporting, custom alerts.

### Week 8: Production Readiness
- **Goal:** Final polish and operationalizing for enterprise reliability.
- **Key Task:** Performance optimization (caching, indices), security hardening (rate limit, JWT), monitoring setup, Dockerfile generation.
