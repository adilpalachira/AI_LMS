# Project Overview - AI-Powered Learning Management System (AI-LMS)

## 1. Executive Summary

**Project Name:** AI-Powered Learning Management System (AI-LMS)  
**Corpus / Repository:** `adilpalachira/AI_LMS`  
**Root Path:** `c:\Users\ADIL\.gemini\antigravity\scratch\ai-lms`  
**Primary Objective:** Deliver a next-generation LMS platform featuring role-based access (Admin, Faculty, Student), rich course & content management, automated assessment pipelines, RAG-driven AI tutoring with source citations, and AI-assisted quiz generation with smart question bank management.

---

## 2. Project Purpose & Scope

The AI-Powered LMS provides a complete ecosystem for educational institutions and online learning platforms. It solves key challenges in modern remote and hybrid education:
- **For Students:** Personalized course access, interactive PDF/Video lesson viewers, automated assignment submission, self-paced quiz attempts with immediate scoring, and 24/7 AI-driven tutoring grounded in actual course lecture materials via Retrieval-Augmented Generation (RAG).
- **For Faculty:** Intuitive course builder, multi-format content uploader (PDF, Video, YouTube, Notes), assignment deadline controls, submission grading & feedback interface, quiz question builder, AI question generator, and question bank governance.
- **For Administrators:** Comprehensive user management (Admin, Faculty, Student), category hierarchy management, global system health diagnostics, role authorization, and course oversight.

---

## 3. Technology Stack

| Layer | Technology | Details / Versions |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 | `react` v18.3.1, `react-dom` v18.3.1 |
| **Frontend Build Tool** | Vite | `vite` v5.2.11, `@vitejs/plugin-react` v4.3.1 |
| **Routing** | React Router DOM | `react-router-dom` v6.23.1 |
| **Styling & UI Components**| Tailwind CSS & Lucide Icons | `tailwindcss` v3.4.3, `lucide-react` v0.395.0 |
| **HTTP Client** | Axios | `axios` v1.7.2 with request/response JWT interceptors |
| **Backend Runtime** | Node.js | CommonJS architecture |
| **Backend Framework** | Express.js | `express` v4.19.2 |
| **Database & ODM** | MongoDB & Mongoose | `mongoose` v8.4.1 (16 defined Mongoose Schemas) |
| **Authentication** | JWT & Bcrypt | `jsonwebtoken` v9.0.2, `bcryptjs` v2.4.3 |
| **FileUpload / Storage** | Multer & Static Express | `multer` v1.4.5-lts.1, disk storage in `/uploads` |
| **AI LLM Integration** | OpenAI SDK | `openai` v7.4.0 (`gpt-4o-mini`, `text-embedding-3-small`) |
| **Vector Store (RAG)** | Pinecone Database | `@pinecone-database/pinecone` v8.2.0 |
| **Text Processing & Chunking**| LangChain & PDF-Parse | `@langchain/textsplitters` v1.0.1, `pdf-parse` v2.4.5 |
| **Validation & Utilities** | Express-Validator & Morgan | `express-validator` v7.1.0, `morgan` v1.10.0 |

---

## 4. Current Development Status & Progress Summary

```text
===================================================================
OVERALL PROJECT COMPLETION: 78%
===================================================================
Current Phase: Phase 4 - Advanced AI Features & System Polish
Backend Status: Functionally Robust with 14 Active Route Groups & 16 Schemas
Frontend Status: Fully Designed & Connected across 25+ Interactive Views
AI Engine Status: Integrated RAG & Fallback Simulation Engine Active
===================================================================
```

---

## 5. Major Project Modules Summary

| Module ID | Module Name | Status | Completion % | Key Capabilities |
| :---: | :--- | :--- | :---: | :--- |
| **Module 1** | Foundation & Architecture | `FUNCTIONALLY COMPLETED` | 90% | Express server setup, MongoDB connection, global error middleware, Axios interceptors, health check endpoint (`/api/health`). |
| **Module 2** | Authentication & Security | `FUNCTIONALLY COMPLETED` | 85% | JWT login/register, refresh tokens, Bcrypt password hashing, Protected Routes, Role Guards (`Admin`, `Faculty`, `Student`). |
| **Module 3** | User Management & Admin | `FUNCTIONALLY COMPLETED` | 85% | Admin user CRUD, user table with search & role/status filtering, profile management, avatar photo upload, password reset. |
| **Module 4** | Course & Category Mgmt | `FUNCTIONALLY COMPLETED` | 85% | Category CRUD, Course CRUD (Draft, Published, Archived), thumbnail upload, student catalog, enrollment workflow (`Enroll`/`Unenroll`). |
| **Module 5** | Content & Lesson Mgmt | `FUNCTIONALLY COMPLETED` | 80% | Section ordering, Lesson creation (PDF, Video, YouTube, Text Note), Material file upload, interactive PDF viewer, HTML5 video player. |
| **Module 6** | Assessment, Exams & Quizzes| `FUNCTIONALLY COMPLETED` | 80% | Assignment CRUD, student file submission, faculty grading interface, Quiz CRUD, Question builder, timed student quiz-taking engine. |
| **Module 7** | AI Tutor & RAG Processing | `PARTIALLY COMPLETED` | 75% | Lecture material PDF extraction, LangChain text chunking, Pinecone vector upsert, RAG completion with source citations, AI Chat UI, fallback mock engine. |
| **Module 8** | AI Quiz Generator & Bank | `PARTIALLY COMPLETED` | 75% | Automated AI question generation by topic/material, difficulty controls, generation history logs, Question Bank approval pipeline, bulk-save. |
| **Module 9** | Dashboard & Analytics | `PARTIALLY COMPLETED` | 60% | Role-tailored dashboards for Admin, Faculty, and Student with metrics, enrollment counts, upcoming deadlines, and recent performance. |
| **Module 10**| Testing, Security & DevOps | `PARTIALLY COMPLETED` | 40% | Centralized error handler, static asset serving, CORS setup. Missing automated test suites and rate limiting. |

---

## 6. Current Working Features

- **Authentication & Role Authorization:** Secure login, registration, JWT token persistence, auto-refresh on client, role-restricted navigation (`RoleGuard.jsx`).
- **Administrative Control Panel:** Full user lifecycle management (add, edit, status toggle, role change, password reset, search, filter).
- **Course Catalog & Builder:** Multi-step course form with thumbnail image upload, slug auto-generation, publish/archive toggles, and student enrollment tracking.
- **Structured Content Management:** Courses divided into ordered Sections, Lessons with multi-format content support (PDF, Video, Text Notes, YouTube), and downloadable attachments.
- **Interactive Student Learning Experience:** Embedded PDF Viewer, custom Video Player with playback controls, lesson progress indicator, and course overview.
- **Assignment Submission & Grading:** Faculty assignment creation with deadline/file restrictions, student file upload with progress bar, and faculty review/scoring UI.
- **Interactive Quiz Taking Engine:** Countdown timer, option shuffling capability, objective question auto-grading, and instant score calculation stored in `QuizAttempt`.
- **RAG AI Tutor Workspace:** Multi-session AI chat interface, suggested course questions, grounded vector retrieval, fallback simulation mode when API keys are absent, and page-level source references.
- **AI Quiz Generation & Question Bank:** Prompt-based AI question generation, question review/approval/archiving workflow, and direct injection into existing quizzes.

---

## 7. Partially Completed Features & Technical Gaps

1. **Forgot & Reset Password Workflow:** Frontend pages and backend routes exist, but backend currently uses simulated token logic without SMTP email delivery.
2. **Student Progress Persistence:** Lesson completion progress is rendered dynamically on the frontend but lacks an explicit `LessonProgress` database schema for persistent per-lesson checkboxes.
3. **Descriptive / Essay Quiz Grading:** Objective questions (MCQ, True/False) auto-grade seamlessly; descriptive/essay questions default to 0 marks until manual faculty grading support is expanded in `TakeQuiz.jsx`.
4. **Real-time AI Streaming:** AI Tutor responses arrive via standard synchronous HTTP JSON payload rather than Server-Sent Events (SSE) or WebSockets.
5. **Standalone PDF Generator Scripts:** Python scripts `generate_pdf.py` and `render_pdf.py` exist in root directory for progress report rendering, but are not hooked into backend Express endpoints.
6. **Redundant Folder Structure:** Root directory contains a skeleton `/backend` folder alongside the active `/server` codebase.

---

## 8. Next Recommended Steps

1. **Phase 4 Completion (AI Polish & Streaming):** Implement Server-Sent Events (SSE) for streaming AI Tutor chat responses and add a clear UI banner indicating whether OpenAI/Pinecone is running in live or fallback mode.
2. **Persistent Student Progress Tracking:** Create a `LessonProgress` schema to record completed lesson IDs per student to support persistent progress percentage across browser sessions.
3. **Automated Test Suite:** Add backend integration tests using `supertest` for critical routes (`/api/auth`, `/api/courses`, `/api/quizzes`).
4. **Clean Redundant Files:** Document `/backend` as obsolete in favor of `/server`.
