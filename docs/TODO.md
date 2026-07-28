# TODO - Prioritized Task List

This prioritized task list outlines all remaining tasks required to complete the AI-Powered Learning Management System (AI-LMS), categorized by priority level (P0 to P3).

---

## P0 – Critical Priority (System Operations & Core Workflows)

- [ ] **P0.1: Connect Real SMTP Transport for Password Reset**
  - Implement real email sending in `auth.controller.js` using Nodemailer instead of returning simulated reset tokens in JSON responses.
  
- [ ] **P0.2: Create Persistent `LessonProgress` Schema & API**
  - Create `server/models/lessonProgress.model.js` to track individual student lesson completions in MongoDB.
  - Implement `POST /api/lessons/:id/toggle-complete` and `GET /api/courses/:id/progress` endpoints.
  - Wire completion checkmarks in `LessonViewer.jsx` to update persistent database progress state.

- [ ] **P0.3: Server Startup Environment Variable Validation**
  - Add strict environment variable validation logic in `server.js` to ensure critical keys (`MONGO_URI`, `JWT_SECRET`) are present before starting express listener.

---

## P1 – High Priority (Feature Completion & System Hardening)

- [ ] **P1.1: Implement Real-Time SSE Streaming for AI Tutor**
  - Refactor `POST /api/ai/tutor/chat` and `tutor.service.js` to support Server-Sent Events (SSE) token streaming for real-time text generation in `AIChatWindow.jsx`.

- [ ] **P1.2: Add AI Service Status Indicator Banner on UI**
  - Add a visual status badge in `AITutorPage.jsx` and `AIQuizGenerator.jsx` informing faculty/students whether OpenAI/Pinecone is operating in Live mode or Simulated Fallback mode.

- [ ] **P1.3: Build Descriptive & Essay Quiz Question Grading UI**
  - Expand `ReviewSubmissions.jsx` or create a Quiz Attempt Review page allowing faculty to manually inspect and assign marks to descriptive/essay quiz questions.

- [ ] **P1.4: Implement Automated Integration Test Suite**
  - Setup `Jest` and `Supertest` in `/server` to write automated unit and integration tests for `/api/auth`, `/api/courses`, `/api/quizzes`, and `/api/assignments`.

- [ ] **P1.5: Express API Security Hardening**
  - Add `express-rate-limit` middleware to prevent brute force attacks on `/api/auth/login`.
  - Add `helmet` middleware for HTTP security header protection.

---

## P2 – Medium Priority (User Experience & Data Management)

- [ ] **P2.1: Implement Course Ratings & Review Submission**
  - Add `POST /api/courses/:id/reviews` endpoint allowing enrolled students who completed lessons to submit 1-5 star ratings and reviews.
  - Render interactive review submit modal on `CourseDetail.jsx`.

- [ ] **P2.2: Export Question Bank Items to QTI / GIFT Format**
  - Add export action on `QuestionBank.jsx` enabling faculty to download selected questions as QTI (XML) or GIFT files for import into Canvas/Moodle.

- [ ] **P2.3: CSV / Excel Bulk User Import & Export**
  - Add bulk CSV upload feature on `admin/Users.jsx` to import student/faculty rosters in batch.

- [ ] **P2.4: Graphical Analytics Dashboard Integration**
  - Integrate visual chart components (using Recharts or Chart.js) on `Dashboard.jsx` for enrollment trends, score distributions, and system usage.

- [ ] **P2.5: Express API PDF Progress Report Endpoint**
  - Wrap root python script `generate_pdf.py` into a clean backend Express route `GET /api/reports/progress-pdf` to allow on-demand progress PDF downloads.

---

## P3 – Low Priority (Polishing & Clean-up)

- [ ] **P3.1: Clean Deprecated Skeleton `/backend` Folder**
  - Safely remove or archive the empty root `/backend` folder to prevent developer confusion with active `/server` codebase.

- [ ] **P3.2: Production Docker Containerization**
  - Create optimized `Dockerfile` and `docker-compose.yml` orchestrating MongoDB, Server API, and Client Vite container builds.

- [ ] **P3.3: Rich UI Animations & Transition Micro-interactions**
  - Add subtle Framer Motion page transition animations across dashboard navigation views.
