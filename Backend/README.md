# JobLystic — Backend Microservices

An event-driven, AI-powered backend architecture powering **JobLystic** (JobAnalytics). The backend consists of three independent microservices communicating synchronously via RESTful APIs and asynchronously via RabbitMQ message queues.

---

## Architecture Overview

```
                      +-------------------+
                      |  React Frontend   |
                      |  (Port: 5173)     |
                      +---------+---------+
                                |
             +------------------+------------------+
             | (REST / Cookies)                    | (REST / Cookies)
             v                                     v
   +-------------------+                 +-------------------+
   |   Auth Service    |                 |    AI Service     |
   |   (Port: 3000)    |                 |   (Port: 3002)    |
   +---------+---------+                 +---------+---------+
             |                                     |
             | [RabbitMQ: Publish Events]          | [Google Gemini 2.5]
             |  - user_registered                  | [Puppeteer (PDF)]
             |  - user_logged_in                   | [Octokit & Firecrawl]
             v                                     v
   +-------------------+                 +-------------------+
   |   RabbitMQ Bus    |                 |     MongoDB       |
   +---------+---------+                 +-------------------+
             |
             | [Consume Events]
             v
   +-------------------+
   |   Notification    |
   |   (Port: 3001)    |
   |   [Nodemailer]    |
   +-------------------+
```

---

## Microservices Breakdown

| Service | Port | Description | Primary Dependencies |
| :--- | :--- | :--- | :--- |
| **Auth Service** | `3000` | User authentication, session cookies, Google OAuth 2.0, OTP password resets | Express 5, Mongoose, Passport, bcrypt, JWT, amqplib, Jest |
| **AI Service** | `3002` | Resume PDF parsing, Gemini-powered interview reports, ATS resume compilation, project audits | Express 5, Mongoose, `@google/genai`, `pdf-parse`, `puppeteer`, `@octokit/rest`, `firecrawl`, Zod |
| **Notification Service** | `3001` | Asynchronous worker consuming RabbitMQ events to dispatch transactional HTML emails | Express 5, Mongoose, `amqplib`, `nodemailer` |

---

## Directory Structure

```
Backend/
├── Ai/                           # AI Evaluation & Report Generation Service
│   ├── src/
│   │   ├── config/               # Environment variable loader
│   │   ├── controllers/          # Report, GenerateAiResume & AnalyzeProject controllers
│   │   ├── db/                   # MongoDB connection logic
│   │   ├── middlewares/          # JWT auth & Multer file upload
│   │   ├── models/               # Separate report, project analysis & generated resume schemas
│   │   ├── routes/               # Report, GenerateAiResume & AnalyzeProject routes
│   │   ├── services/
│   │   │   ├── AiResume/         # Resume generation service & Zod schema
│   │   │   ├── CompanyResearch/  # Company research service & Zod schema
│   │   │   ├── ProjectAnalyze/   # Project audit service & Zod schema
│   │   │   └── Report/           # Interview report service & Zod schema
│   │   └── app.js
│   ├── server.js                 # Entry point (Port 3002)
│   └── package.json
│
├── Auth/                         # Authentication & User Management Service
│   ├── src/
│   │   ├── brokers/              # RabbitMQ publisher & subscriber
│   │   ├── config/               # Auth configuration
│   │   ├── controllers/          # auth.controller.js
│   │   ├── db/                   # MongoDB connection logic
│   │   ├── middlewares/          # JWT verification & express-validator rules
│   │   ├── models/               # auth.models.js (User Schema)
│   │   ├── routes/               # auth.routes.js
│   │   ├── utils/                # Email utilities
│   │   └── app.js
│   ├── tests/                    # Jest automated test suites
│   ├── server.js                 # Entry point (Port 3000)
│   └── package.json
│
└── Notification/                 # Asynchronous Email Worker Service
    ├── src/
    │   ├── brokers/              # RabbitMQ connection & event listener
    │   ├── config/               # Notification service configuration
    │   ├── utils/                # Nodemailer transporter and templates
    │   └── app.js
    ├── server.js                 # Entry point (Port 3001)
    └── package.json
```

---

## 1. Auth Service (`Backend/Auth`)

Handles account registration, login verification, password resets with time-limited OTPs, Google OAuth 2.0 integration, and event emission to RabbitMQ.

### Configuration (`Backend/Auth/.env`)
```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/JobLystic_Auth
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
RABBITMQ_URI=amqp://localhost:5672
EMAIL_USER=your_email@gmail.com
GOOGLE_REFRESH_TOKEN=your_oauth_refresh_token
```

### API Endpoints

#### Authentication & Profile
- `POST /api/auth/register`
  - **Body**: `{ "Fullname": { "firstname": "string", "lastname": "string" }, "email": "user@example.com", "password": "password123" }`
  - **Action**: Creates user, sets HTTP-only `token` cookie, publishes `user_registered` event to RabbitMQ.
- `POST /api/auth/login`
  - **Body**: `{ "email": "user@example.com", "password": "password123" }`
  - **Action**: Verifies credentials, sets HTTP-only `token` cookie, publishes `user_logged_in` event to RabbitMQ.
- `POST /api/auth/logout` *(Protected)*
  - **Action**: Clears `token` cookie.
- `GET /api/auth/getme` *(Protected)*
  - **Action**: Returns authenticated user profile (`id`, `email`, `Fullname`, `profileImage`).
- `POST /api/auth/update` *(Protected)*
  - **Body**: `{ "Fullname": { "firstname": "...", "lastname": "..." } }`

#### Google OAuth 2.0
- `GET /api/auth/google` — Initiates Google sign-in consent screen.
- `GET /api/auth/google/callback` — Google OAuth redirect handler; issues JWT cookie and redirects to `http://localhost:5173/`.

#### Password Recovery Flow
- `POST /api/auth/forgot-password` — Sends 6-digit OTP to user's registered email.
- `POST /api/auth/verify-reset-otp` — Validates supplied OTP and expiration.
- `POST /api/auth/reset-password` — Updates password with newly provided secret.

### Running & Testing Auth Service
```bash
cd Backend/Auth
npm install
npm run dev      # Runs with nodemon on port 3000
npm test         # Executes Jest test suite
```

---

## 2. AI Service (`Backend/Ai`)

Integrates with Google Gemini, Puppeteer, Octokit, and Firecrawl to provide deep job-fit analysis, interview preparation materials, and tailored resume compilation.

### Configuration (`Backend/Ai/.env`)
```env
PORT=3002
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/JobLystic_Ai
JWT_SECRET=your_jwt_secret_key    # Must match Auth Service JWT_SECRET
GEMINI_API_KEY=your_gemini_api_key
GITHUB_API=your_github_personal_access_token
FIRECRAWL_API=your_firecrawl_api_key
```

### Core Pipeline & Modules
1. **Resume Text Extraction (`pdf-parse`)**: Extracts raw text from candidate's PDF document.
2. **AI Report Engine (`Report/AnalyzeReport.Service.js`)**:
   - Compares resume text, self-description, and target job description using Google Gemini.
   - Enforces strict Zod schema validation for structured JSON generation:
     - **Overall Readiness**: Score (0-100), level (Beginner/Intermediate/Advanced), multi-dimensional scores (role alignment, skill coverage, technical knowledge, practical ability).
     - **Company Readiness**: Environment-specific alignment (Startup, Product-based, Service-based, Enterprise, Consulting).
     - **Skill Gaps**: Detailed delta analysis with severity (`low`, `medium`, `high`), current vs. required level, reasons, missing concepts, and action steps.
     - **Preparation Roadmap**: Phased task schedules with estimated completion minutes.
     - **Interview Questions**: Technical and behavioral interview questions with interviewer intentions and recommended responses.
3. **ATS-Compliant Resume Generator (`AiResume/GenerateResumePdf.Service.js`)**:
   - Synthesizes candidate experience against target role requirements into clean semantic HTML.
   - Uses headless **Puppeteer** to compile print-ready A4 PDF resumes.
4. **Project Code & Deployment Audits (`ProjectAnalyze/ProjectAnalyze.Service.js`)**:
   - **GitHub Auditing (`@octokit/rest`)**: Inspects repository architecture patterns, code quality, security considerations, and scalability.
   - **Live URL Crawling (`firecrawl`)**: Inspects deployed web apps for UI/UX quality, responsive navigation, accessibility, and performance findings.

### API Endpoints
- `POST /api/report/interview-report` *(Protected, multipart/form-data)*
  - **Form Fields**: `resume` (PDF file, max 3MB), `jobDescription` (string), `SelfDescription` (string).
  - **Response**: `201 Created` with full interview report JSON and assigned `_id`.
- `GET /api/report/all-reports` *(Protected)*
  - **Response**: List of saved reports for the authenticated user (sorted by date descending).
- `GET /api/report/report/:reportId` *(Protected)*
  - **Response**: Complete report details by ID.
- `PATCH /api/report/report/:reportId/metadata` *(Protected)*
  - **Response**: Updates the report title, target role, and resume title.
- `GET /api/report/ai-library` *(Protected)*
  - **Response**: AI-generated resumes and project analyses for the authenticated user.
- `POST /api/report/resume/pdf/:reportId` *(Protected)*
  - **Response**: Generates and streams tailored PDF resume (`application/pdf`) and stores buffer in MongoDB.
- `GET /api/report/resume/pdf/:reportId` *(Protected)*
  - **Response**: Streams the previously generated PDF resume (`application/pdf`).
- `POST /api/report/:reportId/analyze-projects` *(Protected)*
  - **Response**: Executes GitHub and deployment analysis for projects detected on candidate resume.
- `GET /api/report/:reportId/analyze-projects` *(Protected)*
  - **Response**: Retrieves the saved project analysis for the selected report.

Interview preparation reports, project analyses, and generated resume PDFs are stored independently. Project analyses and resume PDFs reference their report and user; existing MongoDB documents are not migrated or modified by this architecture.

### Running AI Service
```bash
cd Backend/Ai
npm install
npm run dev      # Runs with nodemon on port 3002
```

---

## 3. Notification Service (`Backend/Notification`)

Asynchronous background worker consuming domain events published to RabbitMQ. Ensures non-blocking email delivery.

### Configuration (`Backend/Notification/.env`)
```env
PORT=3001
JWT_SECRET=your_jwt_secret_key
RABBITMQ_URI=amqp://localhost:5672
EMAIL_USER=your_email@gmail.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_oauth_refresh_token
```

### Event Handlers (`src/brokers/listener.js`)
- **`user_registered`**:
  - Payload: `{ email, Fullname: { firstname, lastname } }`
  - Action: Renders welcome template with platform introduction and sends via Nodemailer.
- **`user_logged_in`**:
  - Payload: `{ email, Fullname: { firstname, lastname } }`
  - Action: Dispatches security login alert with timestamp and account details.

### Running Notification Service
```bash
cd Backend/Notification
npm install
npm run dev      # Runs with nodemon on port 3001
```

---

## RabbitMQ Message Broker Flow

1. RabbitMQ server must be accessible (e.g., via Docker: `docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management`).
2. Auth Service publishes events to queues with durable persistence.
3. Notification Service subscribes to queues, acknowledges (`ack`) messages upon successful email processing, and logs errors safely.

---

## Development Setup (Quick Start)

Run each service in a separate terminal:

```bash
# Terminal 1: Auth Service (Port 3000)
cd Backend/Auth
npm install
npm run dev

# Terminal 2: AI Service (Port 3002)
cd Backend/Ai
npm install
npm run dev

# Terminal 3: Notification Service (Port 3001)
cd Backend/Notification
npm install
npm run dev
```
