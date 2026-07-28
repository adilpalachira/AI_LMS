# Project Architecture - AI-Powered Learning Management System (AI-LMS)

## 1. System Overview Architecture

The AI-Powered LMS follows a classic **Decoupled MERN Architecture** (MongoDB, Express.js, React, Node.js) enriched with a **Vector Database (Pinecone)** and **LLM Integration (OpenAI)** for Retrieval-Augmented Generation (RAG) and automated assessment synthesis.

```text
+-------------------------------------------------------------------------+
|                               FRONTEND                                  |
|  React 18 + Vite + Tailwind CSS + Lucide Icons + React Router DOM v6   |
|  (Client Port: 5173 | Global State via AuthContext & Axios Client)       |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTP / REST (JWT Bearer Token)
                                     v
+------------------------------------+------------------------------------+
|                               BACKEND                                   |
|  Node.js + Express.js API Server (Port: 5000)                          |
|  Controllers -> Services -> Middleware -> Express-Validator -> Mongoose |
+---------+--------------------------+--------------------------+---------+
          |                          |                          |
          v                          v                          v
+---------+--------+       +---------+--------+       +---------+--------+
|    DATABASE      |       | VECTOR DATABASE  |       |   EXTERNAL AI    |
| MongoDB (Local)  |       | Pinecone Vector  |       | OpenAI API       |
| Mongoose Models  |       | Index            |       | GPT-4o-mini &    |
| 16 Collections   |       | (Course RAG)     |       | Text-Embedding-3 |
+------------------+       +------------------+       +------------------+
```

---

## 2. Frontend Architecture

### 2.1 Framework & Tools
- **Core Library:** React 18 (`react` v18.3.1) with Functional Components and React Hooks.
- **Build Tool:** Vite v5.2.11 (`@vitejs/plugin-react` v4.3.1) offering instant HMR (Hot Module Replacement) and optimized production bundles.
- **Routing System:** `react-router-dom` v6.23.1 utilizing `<BrowserRouter>`, `<Routes>`, `<Route>`, `<Navigate>`, and `useLocation()`.

### 2.2 Client Folder Structure
```text
client/src/
├── assets/                  # Static assets and graphic logos
├── components/              # Reusable UI component library
│   ├── ai/                  # AI Chat Window, Message, Session List, Sources, Badges
│   ├── assessment/          # Assignment, Submission, Quiz, Question Editor, Timer Cards
│   ├── content/             # PdfViewer, VideoPlayer, SectionCard, LessonCard, FileUpload
│   ├── courses/             # CourseCard, CourseFilter
│   ├── users/               # UserTable, UserForm, UserFilters, DeleteUserModal
│   ├── DashboardLayout.jsx  # Main application layout wrapper
│   ├── Header.jsx           # Top header with user profile menu
│   ├── LoadingSpinner.jsx   # Global loading indicator
│   ├── Navbar.jsx           # Public top navigation bar
│   ├── ProtectedRoute.jsx   # Auth state checker wrapper
│   ├── RoleGuard.jsx        # Role-based authorization checker wrapper
│   ├── Sidebar.jsx          # Dashboard left navigation sidebar
│   └── SidebarPlaceholder.jsx # Skeleton sidebar loading state
├── contexts/                # React Context Providers
│   └── AuthContext.jsx      # Global Authentication State & User Session
├── hooks/                   # Custom React Hooks
│   └── useAuth.js           # Custom hook consuming AuthContext
├── pages/                   # Top-level Page Views
│   ├── admin/               # Administrative views (Users, Add/Edit User, Categories)
│   ├── ai/                  # AITutorPage.jsx (AI Assistant workspace)
│   ├── assessment/          # Assignments, Quizzes, Question Bank, AI Generator pages
│   ├── courses/             # Course Catalog, Details, Manage Courses, Lesson Viewer
│   ├── Dashboard.jsx        # Unified Role-based Dashboard
│   ├── ForgotPassword.jsx   # Forgot Password page
│   ├── Login.jsx            # User Login page
│   ├── Profile.jsx          # User Profile & Password settings page
│   ├── Register.jsx         # User Registration page
│   └── ResetPassword.jsx    # Reset Password page
├── services/                # Axios API Client Abstractions
│   ├── aiTutorService.js    # AI Tutor & Knowledge Doc API methods
│   ├── api.js               # Centralized Axios instance with JWT interceptors
│   ├── assessmentService.js # Assignment, Submission, Quiz & Question Bank APIs
│   ├── contentService.js   # Section, Lesson & Learning Material APIs
│   └── courseService.js     # Category, Course & Enrollment APIs
├── App.css                  # App-specific styling tweaks
├── App.jsx                  # Main Routing configuration & Landing Page component
├── index.css                # Global CSS directives & Tailwind imports
└── main.jsx                 # Application entry point rendering React DOM
```

### 2.3 Main Entry Point & Routing Architecture
- **Entry File:** `client/src/main.jsx` mounts `<App />` inside `#root` wrapped in React StrictMode.
- **Routing File:** `client/src/App.jsx` handles public and private route declarations.
  - **Public Routes:** `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`.
  - **Protected General Routes:** `/dashboard`, `/profile`, `/courses`, `/courses/:id`, `/courses/:courseId/lessons/:lessonId`, `/ai-tutor`, `/assignments`.
  - **Student Restricted Routes (`RoleGuard: Student`):** `/my-courses`, `/courses/:courseId/student-assignments`, `/assignments/:assignmentId/submit`, `/courses/:courseId/student-quizzes`, `/quizzes/:quizId/take`.
  - **Faculty & Admin Routes (`RoleGuard: Admin, Faculty`):** `/manage-courses`, `/courses/new`, `/courses/:id/edit`, `/courses/:id/manage-content`, `/courses/:courseId/assignments`, `/assignments/:id/review`, `/courses/:courseId/quizzes`, `/quizzes/:id/questions`, `/ai-quiz-generator`, `/question-bank`, `/ai-generation-history`, `/quizzes/preview/:id`.
  - **Admin Restricted Routes (`RoleGuard: Admin`):** `/admin/users`, `/admin/users/new`, `/admin/users/:id/edit`, `/admin/users/:id`, `/admin/categories`.

### 2.4 State Management & API Communication
- **Authentication State:** `AuthContext.jsx` manages `user`, `accessToken`, `refreshToken`, `loading`, and authentication actions (`login`, `logout`, `updateUser`).
- **Token Storage:** Tokens and user metadata are stored in `localStorage` (`accessToken`, `refreshToken`, `user`).
- **HTTP Client:** `services/api.js` creates a pre-configured Axios instance (`baseURL: http://localhost:5000/api`).
  - **Request Interceptor:** Automatically appends `Authorization: Bearer <accessToken>` to outgoing requests.
  - **Response Interceptor:** Intercepts `401 Unauthorized` responses, clears local storage tokens, and redirects expired sessions to `/login?expired=true`.

---

## 3. Backend Architecture

### 3.1 Runtime & Framework
- **Runtime:** Node.js (CommonJS `require`/`module.exports` syntax).
- **Framework:** Express.js (`express` v4.19.2).
- **Server Entry File:** `server/server.js`.

### 3.2 Server Folder Structure
```text
server/
├── config/                  # Configuration files
│   ├── aiConfig.js          # RAG, Pinecone, and OpenAI parameters
│   └── db.js                # Mongoose MongoDB connection establishment
├── controllers/             # Request & Response logic handlers
│   ├── aiQuiz.controller.js # AI Quiz Generation controller
│   ├── aiTutor.controller.js# AI Tutor & Chat RAG controller
│   ├── assignment.controller.js # Assignment CRUD controller
│   ├── auth.controller.js   # Register, Login, Token & Auth controller
│   ├── category.controller.js # Category management controller
│   ├── course.controller.js # Course CRUD & Enrollment controller
│   ├── knowledgeDocument.controller.js # Vector index document tracking controller
│   ├── lesson.controller.js # Course Lesson controller
│   ├── material.controller.js # Uploaded Learning Material controller
│   ├── question.controller.js # Question Bank & Quiz Question controller
│   ├── quiz.controller.js   # Quiz CRUD & Student Attempt controller
│   ├── section.controller.js# Course Section controller
│   ├── submission.controller.js # Assignment Submission & Grading controller
│   └── user.controller.js   # Administrative User Management controller
├── middlewares/             # Custom Express Middleware
│   ├── auth.middleware.js   # JWT authentication verification (`protect`)
│   ├── contentUpload.middleware.js # Multer uploader for lesson materials
│   ├── courseUpload.middleware.js # Multer uploader for course thumbnails
│   ├── error.middleware.js  # Global centralized error handler
│   ├── role.middleware.js   # Role authorization checker (`authorizeRoles`)
│   ├── submissionUpload.middleware.js # Multer uploader for student submissions
│   └── upload.middleware.js # Multer uploader for user profile photos
├── models/                  # Mongoose Schemas (16 Schemas)
│   ├── assignment.model.js
│   ├── category.model.js
│   ├── chatMessage.model.js
│   ├── chatSession.model.js
│   ├── course.model.js
│   ├── enrollment.model.js
│   ├── knowledgeDocument.model.js
│   ├── lesson.model.js
│   ├── material.model.js
│   ├── question.model.js
│   ├── quiz.model.js
│   ├── quizAttempt.model.js
│   ├── quizGenerationHistory.model.js
│   ├── section.model.js
│   ├── submission.model.js
│   └── user.model.js
├── routes/                  # Express Route Definitions (14 Route Modules)
│   ├── aiQuiz.routes.js
│   ├── aiTutor.routes.js
│   ├── assignment.routes.js
│   ├── auth.routes.js
│   ├── category.routes.js
│   ├── course.routes.js
│   ├── knowledgeDocument.routes.js
│   ├── lesson.routes.js
│   ├── material.routes.js
│   ├── question.routes.js
│   ├── quiz.routes.js
│   ├── section.routes.js
│   ├── submission.routes.js
│   └── user.routes.js
├── scripts/                 # Server utility & initialization scripts
│   └── seed.js              # Database seed script for default users & courses
├── services/                # Business Logic & External Integrations
│   ├── ai/                  # OpenAI, Embeddings, Prompts & RAG Services
│   │   ├── embedding.service.js # Vector embedding generator
│   │   ├── openai.service.js    # OpenAI API client & Intelligent Fallback engine
│   │   ├── prompt.service.js    # RAG System Prompts
│   │   ├── quizGenerator.service.js # AI Question Generation logic
│   │   ├── quizPrompt.service.js# Quiz Generation System Prompts
│   │   ├── quizValidation.service.js # Question schema validator
│   │   ├── rag.service.js       # RAG context retriever & pipeline
│   │   └── tutor.service.js     # AI Tutor session orchestration
│   ├── rag/                 # Vector Store & Text Processing
│   │   ├── documentProcessor.service.js # File processing pipeline
│   │   ├── textChunker.service.js       # LangChain text chunking
│   │   ├── textExtractor.service.js     # PDF & Text parsing
│   │   └── vectorStore.service.js       # Pinecone Index CRUD operations
│   ├── assignment.service.js
│   ├── category.service.js
│   ├── course.service.js
│   ├── jwt.service.js
│   ├── lesson.service.js
│   ├── material.service.js
│   ├── password.service.js
│   ├── question.service.js
│   ├── quiz.service.js
│   ├── section.service.js
│   ├── submission.service.js
│   └── user.service.js
├── uploads/                 # Static local file storage
│   ├── content/             # Uploaded lesson materials
│   ├── courses/             # Uploaded course thumbnails
│   ├── profile/             # Uploaded profile avatars
│   └── submissions/         # Uploaded student assignment files
├── utils/                   # Shared helper utilities
│   └── response.js          # Standardized HTTP response formatter
└── validators/              # Express-Validator schemas
    ├── assignment.validator.js
    ├── auth.validator.js
    ├── category.validator.js
    ├── course.validator.js
    ├── lesson.validator.js
    ├── material.validator.js
    ├── question.validator.js
    ├── quiz.validator.js
    ├── section.validator.js
    ├── submission.validator.js
    └── user.validator.js
```

---

## 4. Database Architecture

### 4.1 Technology & Configuration
- **Database Engine:** MongoDB v6+ (Connected locally at `mongodb://127.0.0.1:27017/ai-lms`).
- **ODM Library:** Mongoose v8.4.1.
- **Connection Helper:** `server/config/db.js` with auto-reconnect handling and status logging.

### 4.2 Entity Relationship Overview

```text
User (Admin / Faculty / Student)
  │
  ├────── (Created By) ────────► Course ◄────── (Categorized Under) ── Category
  │                                │
  ├────── (Enrolled In) ──────────►│
  │                                ├──► CourseSection ──► Lesson ──► LearningMaterial
  │                                │                                      │
  │                                ├──► Assignment ◄── Submission        │ (RAG Pipeline)
  │                                │        │                              v
  │                                ├──► Quiz ──► Question ◄────── KnowledgeDocument
  │                                │      │          ▲                     │
  │                                │      v          │                     v
  │                                └──► QuizAttempt  └──── QuizGenerationHistory
  │                                
  └────── (Chat Session) ─────────► ChatSession ──► ChatMessage (with RAG Sources)
```

---

## 5. External Services Architecture & AI Engine

### 5.1 RAG & AI Vector Processing Pipeline
1. **Document Upload:** Faculty uploads a PDF or text file under a Lesson via `material.controller.js`.
2. **Background Document Processing:** `documentProcessor.service.js` is triggered asynchronously.
   - Text is extracted using `pdf-parse` or plain text reader (`textExtractor.service.js`).
   - Content is divided into overlapping chunks (`CHUNK_SIZE: 1000`, `CHUNK_OVERLAP: 200`) using LangChain's `RecursiveCharacterTextSplitter`.
   - Vector embeddings are generated using OpenAI `text-embedding-3-small` (`embedding.service.js`).
   - Vectors with rich metadata (`courseId`, `lessonId`, `materialId`, `fileName`, `text`, `pageNumber`) are upserted into Pinecone (`vectorStore.service.js`).
   - A `KnowledgeDocument` record tracks processing status (`PENDING` -> `PROCESSING` -> `COMPLETED`).
3. **AI Tutor Query Execution:** When a student sends a prompt in `AITutorPage.jsx`:
   - `rag.service.js` generates a query embedding and executes a similarity search in Pinecone filtered strictly by `courseId` (`TOP_K: 4`, `SIMILARITY_THRESHOLD: 0.65`).
   - Top matching text chunks are retrieved and injected into system prompts (`prompt.service.js`).
   - OpenAI `gpt-4o-mini` synthesizes a context-grounded response with explicit source citations.

### 5.2 Intelligent Fallback Architecture
If `OPENAI_API_KEY` or `PINECONE_API_KEY` are not configured in environment variables:
- `openai.service.js` and `vectorStore.service.js` detect missing keys gracefully without crashing.
- Fallback engines synthesize structured JSON question arrays for AI Quiz Generation and detailed academic markdown explanations for AI Tutor queries.

---

## 6. Deployment Architecture

- **Development Environment:** Client runs on Vite (`http://localhost:5173`), Server runs on Node.js/Nodemon (`http://localhost:5000`).
- **Static Assets:** Express serves profile images, thumbnails, materials, and submissions statically via `/uploads` route (`http://localhost:5000/uploads/...`).
- **Environment Variables:** Defined in `server/.env` (`PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRE`, `NODE_ENV`, optional `OPENAI_API_KEY`, `PINECONE_API_KEY`).
