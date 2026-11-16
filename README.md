# JobLystic — AI-Powered Career Readiness & Interview Intelligence Platform

> Evaluate your career readiness, diagnose skill gaps, prepare with custom roadmaps and questions, audit your portfolio projects, and generate tailored ATS-friendly resumes using Google Gemini.


[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-lightgrey.svg)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://ai.google.dev/)
[![RabbitMQ](https://img.shields.io/badge/Messaging-RabbitMQ-ff6600.svg)](https://www.rabbitmq.com/)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Environment Variables](#environment-variables)
- [Quick Start & Running Guide](#quick-start--running-guide)
- [End-to-End User Flow](#end-to-end-user-flow)
- [Testing](#testing)
- [Submodule Documentation](#submodule-documentation)

---

## Overview

**JobLystic** (also known as JobAnalytics) bridges the gap between job candidates and target job descriptions. By uploading a PDF resume and providing target role details, the platform performs deep artificial intelligence evaluation against hiring expectations.

Beyond generic feedback, JobLystic provides:
1. Exact percentage alignment across practical, technical, and role-based dimensions.
2. Company-type-specific readiness assessments (e.g., Startups vs. Enterprises vs. Service-based firms).
3. Severity-weighted skill gap audits with missing concepts and study plans.
4. Curated technical and behavioral questions with interviewer intentions and model answers.
5. Automated generation of an ATS-optimized PDF resume tailored specifically to the targeted role.
6. Automated code quality and deployed web application audits from candidate GitHub and project URLs.

---

## Key Features

- **Multi-Dimensional Career Readiness**: Evaluates overall score (0-100), readiness tier (`Beginner`, `Intermediate`, `Advanced`), and dimensional scores (Role Alignment, Skill Coverage, Technical Knowledge, and Practical Ability).
- **Environment-Specific Company Evaluation**: Assesses readiness across **Startup**, **Product-based**, **Service-based**, **Enterprise**, and **Consulting** hiring bars.
- **Granular Skill Gap Analysis**: Highlights skills with high/medium/low severity, current vs. required proficiency, reasoning, and suggested action items.
- **Sprint-Based Preparation Roadmap**: Generates day-by-day learning tasks categorized by type (`learn`, `practice`, `project`, `assessment`) with estimated completion time in minutes.
- **Tailored Interview Question Bank**: Formulates role-specific technical deep-dives and STAR-method behavioral inquiries with expected answer frameworks.
- **Automated ATS Resume Generator**: Synthesizes profile data and compiles clean, single-column, ATS-friendly PDF resumes on-the-fly using headless **Puppeteer**.
- **Portfolio & Project Audits**:
  - **GitHub Auditing (`@octokit/rest`)**: Inspects architecture, code quality, testing patterns, and scalability directly from repository code.
  - **Deployed Application Auditing (`firecrawl`)**: Crawls live applications to evaluate UI/UX, navigation, accessibility, and performance.
- **Event-Driven Asynchronous Notifications**: Sends transactional welcome emails and security login alerts via **RabbitMQ** and **Nodemailer**.
- **Secure Authentication**: Supports JWT HTTP-only session cookies, bcrypt password hashing, OTP-based password recovery, and **Google OAuth 2.0**.
- **Modern Responsive UI**: React 19 interface styled with SCSS, featuring interactive PDF previews and persistent Dark/Light theme switching.

---

## Architecture

```
                                  +-----------------------+
                                  |   React 19 Frontend   |
                                  |   Vite · Port 5173    |
                                  +-----------+-----------+
                                              |
                   +--------------------------+--------------------------+
                   | (REST / Cookie Auth)                                | (REST / Cookie Auth)
                   v                                                     v
       +-----------------------+                             +-----------------------+
       |     Auth Service      |                             |      AI Service       |
       |   Express · Port 3000 |                             |  Express · Port 3002  |
       +-----------+-----------+                             +-----------+-----------+
                   |                                                     |
                   | [Publish Events]                                    | [Gemini 2.5]
                   |  - user_registered                                  | [Puppeteer PDF]
                   |  - user_logged_in                                   | [Octokit & Firecrawl]
                   v                                                     v
       +-----------------------+                             +-----------------------+
       |   RabbitMQ Bus        |                             |     MongoDB Atlas     |
       +-----------+-----------+                             +-----------------------+
                   |
                   | [Subscribe & Consume]
                   v
       +-----------------------+
       | Notification Service  |
       |  Express · Port 3001  |
       |     [Nodemailer]      |
       +-----------------------+
```

---

## Tech Stack

### Frontend
- **Framework**: React 19, React Router v7 (`react-router-dom`)
- **Build Tool**: Vite 8
- **Styling**: SCSS / Sass with CSS Custom Properties (Theme Engine)
- **HTTP Client**: Axios with credentials (`withCredentials: true`)

### Backend Microservices
- **Core Platform**: Node.js (ES Modules), Express 5
- **Database**: MongoDB (Mongoose ODM)
- **Message Broker**: RabbitMQ (`amqplib`)
- **AI Engine**: `@google/genai` (Google Gemini with structured Zod outputs)
- **Document Processing**: `pdf-parse` (PDF text extraction), `puppeteer` (A4 PDF compilation)
- **Third-Party Integrations**: `@octokit/rest` (GitHub API), `firecrawl` (Web crawler)
- **Authentication**: `jsonwebtoken`, `passport`, `passport-google-oauth20`, `bcrypt`
- **Email Service**: `nodemailer`
- **Testing**: Jest

---

## Repository Structure

```
GenAi/
├── Backend/                      # Backend microservices root
│   ├── Ai/                       # AI Evaluation & Report Service (Port 3002)
│   ├── Auth/                     # Authentication & User Management Service (Port 3000)
│   ├── Notification/             # Asynchronous Email Consumer Service (Port 3001)
│   └── README.md                 # Backend detailed documentation
│
├── Frontend/                     # React 19 Frontend application (Port 5173)
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Shared UI components (e.g., ToggleTheme)
│   │   ├── contexts/             # Global contexts (Theme)
│   │   ├── Features/             # Modular feature slices (AiReports, Auth)
│   │   ├── pages/                # Primary views (Home.jsx)
│   │   ├── routes/               # Centralized routing definitions
│   │   └── styles/               # Global SCSS stylesheets
│   ├── index.html
│   ├── vite.config.js
│   └── README.md                 # Frontend detailed documentation
│
└── README.md                     # Root project guide
```

---

## Environment Variables

Each backend microservice requires its own `.env` file. Create `.env` in the respective directory:

### 1. `Backend/Auth/.env`
```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/JobLystic_Auth
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
RABBITMQ_URI=amqp://localhost:5672
EMAIL_USER=your_email@gmail.com
GOOGLE_REFRESH_TOKEN=your_oauth2_refresh_token
```

### 2. `Backend/Ai/.env`
```env
PORT=3002
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/JobLystic_Ai
JWT_SECRET=your_super_secret_jwt_key    # Must match Auth service JWT_SECRET
GEMINI_API_KEY=your_gemini_api_key
GITHUB_API=your_github_personal_access_token
FIRECRAWL_API=your_firecrawl_api_key
```

### 3. `Backend/Notification/.env`
```env
PORT=3001
JWT_SECRET=your_super_secret_jwt_key
RABBITMQ_URI=amqp://localhost:5672
EMAIL_USER=your_email@gmail.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_oauth2_refresh_token
```

---

## Quick Start & Running Guide

### Prerequisites
- [Node.js (v18+)](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- [RabbitMQ](https://www.rabbitmq.com/) (Local installation or Docker container)

To run RabbitMQ quickly via Docker:
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### 1. Start Backend Microservices
Open three separate terminals:

```bash
# Terminal 1 — Auth Service (Port 3000)
cd Backend/Auth
npm install
npm run dev

# Terminal 2 — AI Service (Port 3002)
cd Backend/Ai
npm install
npm run dev

# Terminal 3 — Notification Service (Port 3001)
cd Backend/Notification
npm install
npm run dev
```

### 2. Start Frontend Application
In a fourth terminal:

```bash
# Terminal 4 — Frontend Client (Port 5173)
cd Frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## End-to-End User Flow

1. **Sign Up / Log In**: Create an account or sign in with Google OAuth. The notification service triggers a welcome or login security email asynchronously.
2. **Career Workspace**:
   - Paste the target Job Description.
   - Enter your personal self-description and background.
   - Upload your resume in PDF format (preview it within the browser modal).
3. **AI Generation**: Click **"Analyze my profile"**.
   - The AI service extracts text via `pdf-parse`.
   - Google Gemini evaluates fit against the schema with Zod validation.
   - Generates scores, roadmaps, question banks, and company readiness matrices.
4. **Interactive Dashboard**:
   - Review overall score and dimensional strengths.
   - Compare readiness across Startup vs. Product vs. Enterprise tiers.
   - Inspect specific skill gaps and targeted actions.
   - Study technical and behavioral questions.
5. **Tailored Resume & Project Audit**:
   - Generate and download an ATS-friendly PDF resume via Puppeteer.
   - Audit code repositories and live deployed URLs linked in your resume.

---

## Testing

Run the local automated suites independently:
```bash
cd Backend/Auth
npm test

cd ../Ai
npm test

cd ../Notification
npm test
```

These suites use mocked providers and in-memory model stubs; they do not call paid AI/GitHub/Firecrawl services or write to MongoDB.

---

## Submodule Documentation

For in-depth service-level guides and endpoint specifications:
- [Backend Documentation](file:///c:/Users/ASUS/OneDrive/Desktop/programming/GenAi/Backend/README.md)
- [Frontend Documentation](file:///c:/Users/ASUS/OneDrive/Desktop/programming/GenAi/Frontend/README.md)
