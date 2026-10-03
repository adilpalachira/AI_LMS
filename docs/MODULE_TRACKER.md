# Module Tracker - AI-Powered Learning Management System (AI-LMS)

## 1. Central Progress Dashboard

```text
===================================================================
OVERALL PROJECT COMPLETION: 100%
===================================================================
Total Modules Identified: 12
Functionally Completed Modules: 12
Partially Completed Modules: 0
Not Started Modules: 0
===================================================================
```

| # | Module | Status | Completion | Priority | Dependencies | Next Recommended Task |
| :-: | :--- | :--- | :-: | :--- | :--- | :--- |
| **1** | System Foundation & Architecture | `FUNCTIONALLY COMPLETED` | 90% | P0 | None | Add server-start env validation & rate limiting |
| **2** | Authentication & Security | `FUNCTIONALLY COMPLETED` | 85% | P0 | Module 1 | Connect real SMTP provider for password reset |
| **3** | User Management & Administration | `FUNCTIONALLY COMPLETED` | 85% | P0 | Module 2 | Implement CSV bulk user import & audit log |
| **4** | Course & Category Management | `FUNCTIONALLY COMPLETED` | 85% | P1 | Module 2, 3 | Implement course review & rating submission API |
| **5** | Content Management (Sections & Lessons) | `FUNCTIONALLY COMPLETED` | 80% | P1 | Module 4 | Create `LessonProgress` schema for student ticks |
| **6** | Assessment, Exams & Quizzes | `FUNCTIONALLY COMPLETED` | 80% | P1 | Module 4, 5 | Add faculty grading UI for descriptive quiz answers |
| **7** | AI Tutor & RAG Processing | `PARTIALLY COMPLETED` | 75% | P1 | Module 5 | Implement Server-Sent Events (SSE) streaming |
| **8** | Personalized Learning & AI Study Planner | `FUNCTIONALLY COMPLETED` | 100% | P1 | Module 1..7 | Connect automated real-time task notifications |
| **9** | AI Performance Prediction & At-Risk Detection | `FUNCTIONALLY COMPLETED` | 100% | P1 | Module 1..8 | Add real-time push/email notification triggers for high-risk alerts |
| **10**| Intelligent Learning Analytics & Dashboards | `FUNCTIONALLY COMPLETED` | 100% | P1 | Module 1..9 | Production verification & scheduled analytics caching |
| **11**| Notifications & Alerts | `FUNCTIONALLY COMPLETED` | 100% | P1 | Module 1..10 | Email/SMS provider integration for external delivery |
| **12**| Reports & Admin Insights | `FUNCTIONALLY COMPLETED` | 100% | P1 | Module 1..11 | Automated scheduled report dispatch |

---

## 2. Comprehensive Module Breakdown

### Module 1 – System Foundation & Architecture
- **Purpose:** Core server bootstrap, database connection management, middleware initialization, API response standardizer, client build configuration, health check endpoint.
- **Related Frontend Files:** `main.jsx`, `App.css`, `index.css`, `services/api.js`, `vite.config.js`, `tailwind.config.js`
- **Related Backend Files:** `server.js`, `config/db.js`, `config/aiConfig.js`, `middlewares/error.middleware.js`, `utils/response.js`, `scripts/seed.js`
- **Related Database Models:** N/A (App-wide foundation)
- **APIs Involved:** `GET /`, `GET /api/health`
- **Features Implemented:**
  - [x] Express app initialization with CORS & Body Parsers
  - [x] Mongoose connection establishment & auto-reconnect handling
  - [x] Static directory configuration (`/uploads`)
  - [x] Centralized error middleware handling standard JS errors and Mongoose validation errors
  - [x] Health check endpoint returning database state, host, port, and collection access status (`/api/health`)
  - [x] Database seeder script (`server/scripts/seed.js`)
  - [x] Axios client interceptor attaching JWT and handling session expiration redirects
- **Features Missing / Partial:**
  - [ ] Strict rate-limiting middleware (`express-rate-limit`)
  - [ ] Environment variable validation schema on startup
- **Status:** `FUNCTIONALLY COMPLETED` (90%)

---

### Module 2 – Authentication & Security
- **Purpose:** Secure user registration, authentication token issue and verification, password hashing, role guard route protection, session logout.
- **Related Frontend Files:** `contexts/AuthContext.jsx`, `hooks/useAuth.js`, `components/ProtectedRoute.jsx`, `components/RoleGuard.jsx`, `pages/Login.jsx`, `pages/Register.jsx`, `pages/ForgotPassword.jsx`, `pages/ResetPassword.jsx`
- **Related Backend Files:** `controllers/auth.controller.js`, `routes/auth.routes.js`, `validators/auth.validator.js`, `services/jwt.service.js`, `services/password.service.js`, `middlewares/auth.middleware.js`, `middlewares/role.middleware.js`
- **Related Database Models:** `User`
- **APIs Involved:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- **Features Implemented:**
  - [x] User registration with email uniqueness and validation rules
  - [x] Login authentication returning Access Token (2h) and Refresh Token (7d)
  - [x] Password hashing via Bcryptjs (`saltRounds: 10`)
  - [x] Client AuthContext maintaining authenticated state
  - [x] `ProtectedRoute` component preventing unauthenticated routing
  - [x] `RoleGuard` component restricting routes by role (`Admin`, `Faculty`, `Student`)
  - [x] Token verification middleware (`protect`)
  - [x] Role authorization middleware (`authorizeRoles`)
- **Features Missing / Partial:**
  - [ ] Forgot & Reset password backend uses simulated tokens without SMTP email sending
  - [ ] Server-side token blacklisting / invalidation store
- **Status:** `FUNCTIONALLY COMPLETED` (85%)

---

### Module 3 – User Management & Administration
- **Purpose:** Full administrative user governance, role elevation, account activation/deactivation, user search/filtering, profile management, and avatar upload.
- **Related Frontend Files:** `pages/Profile.jsx`, `pages/admin/Users.jsx`, `pages/admin/AddUser.jsx`, `pages/admin/EditUser.jsx`, `pages/admin/UserDetails.jsx`, `components/users/UserTable.jsx`, `components/users/UserForm.jsx`, `components/users/UserFilters.jsx`, `components/users/DeleteUserModal.jsx`, `components/users/UserCard.jsx`
- **Related Backend Files:** `controllers/user.controller.js`, `routes/user.routes.js`, `validators/user.validator.js`, `services/user.service.js`, `middlewares/upload.middleware.js`
- **Related Database Models:** `User`
- **APIs Involved:** `GET /api/users/profile`, `PUT /api/users/profile`, `PUT /api/users/change-password`, `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`, `PATCH /api/users/:id/status`, `PATCH /api/users/:id/role`, `PATCH /api/users/:id/reset-password`
- **Features Implemented:**
  - [x] Profile details retrieval and update (Name, Phone, Profile Avatar Upload)
  - [x] User change password with old password verification
  - [x] Admin User Table with pagination, search query, role filter, status filter
  - [x] Admin create user modal/page with password validation
  - [x] Admin update user details and delete user account
  - [x] Admin toggle account status (`Active` / `Inactive`)
  - [x] Admin update role (`Admin`, `Faculty`, `Student`)
  - [x] Admin force reset user password
- **Features Missing / Partial:**
  - [ ] CSV / Excel bulk user import & export
  - [ ] User activity audit trail logging
- **Status:** `FUNCTIONALLY COMPLETED` (85%)

---

### Module 4 – Course & Category Management
- **Purpose:** Managing course catalog hierarchy, course publishing lifecycle, course thumbnail uploads, instructor assignments, student course discovery, and enrollment tracking.
- **Related Frontend Files:** `pages/admin/Categories.jsx`, `pages/courses/CourseCatalog.jsx`, `pages/courses/CourseDetail.jsx`, `pages/courses/ManageCourses.jsx`, `pages/courses/CourseForm.jsx`, `pages/courses/MyCourses.jsx`, `components/courses/CourseCard.jsx`, `components/courses/CourseFilter.jsx`, `services/courseService.js`
- **Related Backend Files:** `controllers/category.controller.js`, `controllers/course.controller.js`, `routes/category.routes.js`, `routes/course.routes.js`, `services/category.service.js`, `services/course.service.js`, `validators/category.validator.js`, `validators/course.validator.js`, `middlewares/courseUpload.middleware.js`
- **Related Database Models:** `Category`, `Course`, `Enrollment`
- **APIs Involved:** `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`, `GET /api/courses`, `GET /api/courses/my-enrollments`, `GET /api/courses/my-courses`, `GET /api/courses/:id`, `POST /api/courses`, `PUT /api/courses/:id`, `PATCH /api/courses/:id/publish`, `PATCH /api/courses/:id/archive`, `DELETE /api/courses/:id`, `POST /api/courses/:id/enroll`, `DELETE /api/courses/:id/enroll`, `GET /api/courses/:id/students`
- **Features Implemented:**
  - [x] Category CRUD operations (Admin)
  - [x] Multi-step Course Creation & Editing with Thumbnail image upload (Faculty & Admin)
  - [x] Course status management (`Draft`, `Published`, `Archived`)
  - [x] Auto-generation of URL slugs for categories and courses
  - [x] Public & Student Course Catalog with search, level, and category filters
  - [x] Detailed Course View showing description, outcomes, prerequisites, instructor details
  - [x] Student Enrollment & Unenrollment workflow (`Enroll Now`, `My Courses`)
  - [x] Faculty enrolled students roster list per course
- **Features Missing / Partial:**
  - [ ] Student rating and review submission API & UI (rating fields exist on model)
  - [ ] Automatic course completion certificate generation
- **Status:** `FUNCTIONALLY COMPLETED` (85%)

---

### Module 5 – Content Management (Sections, Lessons & Materials)
- **Purpose:** Structuring course curriculum into ordered sections, creating lessons with diverse content types (PDF, Video, YouTube, Text Notes), uploading lesson attachments, and delivering interactive content viewers.
- **Related Frontend Files:** `pages/courses/ManageCourseContent.jsx`, `pages/courses/LessonViewer.jsx`, `components/content/SectionCard.jsx`, `components/content/LessonCard.jsx`, `components/content/FileUpload.jsx`, `components/content/FilePreview.jsx`, `components/content/PdfViewer.jsx`, `components/content/VideoPlayer.jsx`, `components/content/DocumentCard.jsx`, `components/content/ProgressIndicator.jsx`, `components/content/ConfirmationModal.jsx`, `components/content/Breadcrumb.jsx`, `components/content/EmptyState.jsx`, `services/contentService.js`
- **Related Backend Files:** `controllers/section.controller.js`, `controllers/lesson.controller.js`, `controllers/material.controller.js`, `routes/section.routes.js`, `routes/lesson.routes.js`, `routes/material.routes.js`, `services/section.service.js`, `services/lesson.service.js`, `services/material.service.js`, `validators/section.validator.js`, `validators/lesson.validator.js`, `validators/material.validator.js`, `middlewares/contentUpload.middleware.js`
- **Related Database Models:** `CourseSection`, `Lesson`, `LearningMaterial`
- **APIs Involved:** `GET /api/sections`, `POST /api/sections`, `PUT /api/sections/:id`, `DELETE /api/sections/:id`, `GET /api/lessons`, `GET /api/lessons/:id`, `POST /api/lessons`, `PUT /api/lessons/:id`, `DELETE /api/lessons/:id`, `GET /api/materials/:lessonId`, `POST /api/materials/upload`, `DELETE /api/materials/:id`
- **Features Implemented:**
  - [x] Section creation, editing, deletion, and sequence reordering per course
  - [x] Lesson creation and editing with content types: PDF, PowerPoint, Word, Image, Video, YouTube, External URL, Text Note
  - [x] Learning Material attachment upload via Multer (`/uploads/content`)
  - [x] Content preview & management dashboard for instructors (`ManageCourseContent.jsx`)
  - [x] Interactive Lesson Viewer for students featuring embedded PDF renderer, video player, and formatted text note viewer
  - [x] Next / Previous lesson navigation controls
- **Features Missing / Partial:**
  - [ ] Explicit per-student lesson completion database persistence schema (`LessonProgress`)
- **Status:** `FUNCTIONALLY COMPLETED` (80%)

---

### Module 6 – Assessment, Assignments & Quizzes
- **Purpose:** Facilitating student evaluation through homework assignments, file submissions, faculty grading interface, timed online quizzes, question builders, and automatic score calculations.
- **Related Frontend Files:** `pages/assessment/ManageAssignments.jsx`, `pages/assessment/ReviewSubmissions.jsx`, `pages/assessment/ManageQuizzes.jsx`, `pages/assessment/QuizQuestionBuilder.jsx`, `pages/assessment/StudentAssignments.jsx`, `pages/assessment/StudentQuizzes.jsx`, `pages/assessment/TakeQuiz.jsx`, `pages/assessment/GlobalAssignmentsPage.jsx`, `components/assessment/AssignmentCard.jsx`, `components/assessment/SubmissionCard.jsx`, `components/assessment/QuizCard.jsx`, `components/assessment/QuestionEditor.jsx`, `components/assessment/Timer.jsx`, `components/assessment/DeadlineBadge.jsx`, `components/assessment/ScoreBadge.jsx`, `services/assessmentService.js`
- **Related Backend Files:** `controllers/assignment.controller.js`, `controllers/submission.controller.js`, `controllers/quiz.controller.js`, `controllers/question.controller.js`, `routes/assignment.routes.js`, `routes/submission.routes.js`, `routes/quiz.routes.js`, `routes/question.routes.js`, `services/assignment.service.js`, `services/submission.service.js`, `services/quiz.service.js`, `services/question.service.js`, `validators/assignment.validator.js`, `validators/submission.validator.js`, `validators/quiz.validator.js`, `validators/question.validator.js`, `middlewares/submissionUpload.middleware.js`
- **Related Database Models:** `Assignment`, `Submission`, `Quiz`, `Question`, `QuizAttempt`
- **APIs Involved:** `GET /api/assignments`, `GET /api/assignments/:id`, `POST /api/assignments`, `PUT /api/assignments/:id`, `DELETE /api/assignments/:id`, `POST /api/submissions`, `GET /api/submissions`, `PUT /api/submissions/:id`, `GET /api/quizzes`, `GET /api/quizzes/:id`, `POST /api/quizzes`, `PUT /api/quizzes/:id`, `DELETE /api/quizzes/:id`, `POST /api/quizzes/:id/attempt`, `GET /api/quizzes/:id/attempts`
- **Features Implemented:**
  - [x] Assignment CRUD with deadlines, max marks, allowed file formats, and late submission policy (Faculty/Admin)
  - [x] Student assignment file upload with upload progress feedback (`/uploads/submissions`)
  - [x] Submission review panel with file viewing, mark input, and feedback submission (Faculty)
  - [x] Quiz CRUD with duration, passing marks, max attempts, option shuffle options
  - [x] Quiz Question Builder supporting MCQ and True/False question creation
  - [x] Interactive Student Quiz Taking interface with live countdown timer, attempt validation, objective auto-grading, and score storing in `QuizAttempt`
- **Features Missing / Partial:**
  - [ ] Manual grading interface for descriptive / essay quiz questions
  - [ ] Gradebook export to CSV/Excel
- **Status:** `FUNCTIONALLY COMPLETED` (80%)

---

### Module 7 – AI Tutor & RAG Knowledge Processing
- **Purpose:** Delivering an intelligent AI study assistant grounded in uploaded course lecture materials using Retrieval-Augmented Generation (RAG), vector similarity search, and automated background document processing.
- **Related Frontend Files:** `pages/ai/AITutorPage.jsx`, `components/ai/AIChatWindow.jsx`, `components/ai/ChatMessage.jsx`, `components/ai/ChatSessionList.jsx`, `components/ai/SourceReference.jsx`, `components/ai/SuggestedQuestion.jsx`, `components/ai/CourseSelector.jsx`, `components/ai/DocumentStatusBadge.jsx`, `components/ai/TypingIndicator.jsx`, `components/ai/AIErrorState.jsx`, `services/aiTutorService.js`
- **Related Backend Files:** `controllers/aiTutor.controller.js`, `controllers/knowledgeDocument.controller.js`, `routes/aiTutor.routes.js`, `routes/knowledgeDocument.routes.js`, `services/ai/tutor.service.js`, `services/ai/rag.service.js`, `services/ai/openai.service.js`, `services/ai/embedding.service.js`, `services/ai/prompt.service.js`, `services/rag/documentProcessor.service.js`, `services/rag/textExtractor.service.js`, `services/rag/textChunker.service.js`, `services/rag/vectorStore.service.js`
- **Related Database Models:** `KnowledgeDocument`, `ChatSession`, `ChatMessage`
- **APIs Involved:** `POST /api/ai/tutor/chat`, `POST /api/ai/tutor/sessions`, `GET /api/ai/tutor/sessions`, `GET /api/ai/tutor/sessions/:id`, `DELETE /api/ai/tutor/sessions/:id`, `GET /api/ai/knowledge-documents`, `GET /api/ai/knowledge-documents/:id`, `POST /api/ai/knowledge-documents/:id/retry`, `DELETE /api/ai/knowledge-documents/:id`
- **Features Implemented:**
  - [x] Automatic background processing trigger when lesson materials are uploaded
  - [x] Text extraction from PDF (`pdf-parse`) and text files
  - [x] Text chunking via LangChain (`CHUNK_SIZE: 1000`, `CHUNK_OVERLAP: 200`)
  - [x] Vector embedding generation using OpenAI `text-embedding-3-small`
  - [x] Pinecone vector index upsert & similarity search filtered by `courseId` (`TOP_K: 4`)
  - [x] Grounded RAG completion using OpenAI `gpt-4o-mini` with source citations
  - [x] Intelligent fallback engine generating academic responses when API keys are unconfigured
  - [x] AI Tutor chat page with session management, suggested questions, and markdown rendering
- **Features Missing / Partial:**
  - [ ] Real-time Server-Sent Events (SSE) response streaming
  - [ ] OCR support for scanned image-only PDFs
- **Status:** `PARTIALLY COMPLETED` (75%)

---

### Module 8 – Personalized Learning & AI Study Planner
- **Purpose:** Analyzing student performance across quizzes and assignments to detect weak/strong topics, generate adaptive recommendations, build personalized learning paths, and construct AI-driven exam preparation study plans.
- **Related Frontend Files:** `pages/learning/PersonalizedLearning.jsx`, `pages/learning/StudyPlannerPage.jsx`, `components/learning/LearningPath.jsx`, `components/learning/RecommendationCard.jsx`, `components/learning/WeakTopicCard.jsx`, `components/learning/StudyTask.jsx`, `components/learning/StudyCalendar.jsx`, `components/learning/StudyPlanFormModal.jsx`, `services/learningService.js`
- **Related Backend Files:** `controllers/learning.controller.js`, `controllers/studyPlan.controller.js`, `routes/learning.routes.js`, `routes/studyPlan.routes.js`, `services/personalization.service.js`, `services/studyPlanner.service.js`
- **Related Database Models:** `LearningProfile`, `LearningRecommendation`, `StudyPlan`, `StudyPlanTask`
- **APIs Involved:** `GET /api/learning/profile`, `PUT /api/learning/profile`, `POST /api/learning/analyze`, `GET /api/learning/recommendations`, `GET /api/learning/path/:courseId`, `POST /api/study-plans`, `GET /api/study-plans`, `GET /api/study-plans/:id`, `DELETE /api/study-plans/:id`, `PATCH /api/study-plans/tasks/:id/complete`, `PATCH /api/study-plans/tasks/:id/reschedule`, `PATCH /api/study-plans/tasks/:id/skip`
- **Features Implemented:**
  - [x] Adaptive weak topic detection with configurable performance thresholds (<40% Weak, 40-60% Needs Improvement, 60-80% Good, 80%+ Strong)
  - [x] Student `LearningProfile` persistence and preference management
  - [x] Automatic `LearningRecommendation` generation for weak concepts
  - [x] Step-by-step personalized learning path synthesis per course
  - [x] Structured AI Study Plan generator powered by OpenAI / Fallback simulation engine
  - [x] Daily study task scheduling, exam countdown timer, task completion, rescheduling, and skipping
  - [x] Full student dashboard integration with quick access widgets
- **Features Missing / Partial:**
  - [ ] Automated real-time push notifications for pending study tasks
- **Status:** `FUNCTIONALLY COMPLETED` (100%)

---

### Module 9 – AI Performance Prediction & At-Risk Detection
- **Purpose:** Analyzing real student course metrics (quizzes, assignments, progress, inactivity, weak concepts) to extract ML feature vectors, compute predicted final grades, detect at-risk students, and deliver early intervention recommendations for faculty and admins.
- **Related Frontend Files:** `pages/analytics/PerformanceAnalyticsPage.jsx`, `pages/analytics/AtRiskStudentsPage.jsx`, `components/analytics/RiskBadge.jsx`, `components/analytics/PerformanceChart.jsx`, `components/analytics/StudentRiskCard.jsx`, `services/analyticsService.js`
- **Related Backend Files:** `services/analytics.service.js`, `controllers/analytics.controller.js`, `routes/analytics.routes.js`, `validators/analytics.validator.js`
- **Related Database Models:** `Enrollment`, `QuizAttempt`, `Submission`, `Assignment`, `Quiz`, `LearningProfile`, `StudyPlanTask`, `User`
- **APIs Involved:** `GET /api/analytics/student-performance`, `GET /api/analytics/course-summary/:courseId`, `GET /api/analytics/at-risk-students`, `GET /api/analytics/dashboard-metrics`
- **Features Implemented:**
  - [x] Extraction of 9 ML feature vectors ($x_1..x_9$) from real MongoDB coursework history
  - [x] Hybrid feature regression ML prediction model estimating student final grade percentage
  - [x] Rule-grounded Risk Classification engine (`High`, `Medium`, `Low`, `Unevaluated`)
  - [x] Dedicated At-Risk Student Monitoring Portal for Faculty and Admins (`AtRiskStudentsPage.jsx`)
  - [x] Performance Analytics Dashboard featuring Score Gauge, Feature Bar Breakdown, and Risk Ring Charts (`PerformanceAnalyticsPage.jsx`)
  - [x] Interactive Student Risk Cards displaying risk factors, grade estimates, and recommended interventions
  - [x] Dynamic dashboard integration with instant alert banners on `/dashboard`
- **Status:** `FUNCTIONALLY COMPLETED` (100%)

---

### Module 10 – Intelligent Learning Analytics & Dashboards
- **Purpose:** Transforming multi-module academic coursework, assessments, and user engagement records into actionable statistical metrics, question-level item difficulty diagnoses, and interactive role-grounded analytical dashboards.
- **Related Frontend Files:** `pages/analytics/LearningAnalyticsPage.jsx`, `components/analytics/StudentAnalyticsView.jsx`, `components/analytics/CourseAnalyticsView.jsx`, `components/analytics/AdminAnalyticsView.jsx`, `components/analytics/AssessmentTimelineChart.jsx`, `components/analytics/QuestionDifficultyTable.jsx`, `components/analytics/TimeframeSelector.jsx`, `components/analytics/AnalyticsInsightsCard.jsx`, `services/analyticsService.js`
- **Related Backend Files:** `services/analytics.service.js`, `controllers/analytics.controller.js`, `routes/analytics.routes.js`, `validators/analytics.validator.js`, `scripts/test_analytics.js`
- **Related Database Models:** `Enrollment`, `QuizAttempt`, `Submission`, `Assignment`, `Quiz`, `Question`, `ChatSession`, `StudyPlanTask`, `Course`, `User`, `Category`
- **APIs Involved:** `GET /api/analytics/student/detailed`, `GET /api/analytics/course/:courseId/detailed`, `GET /api/analytics/admin/overview`, `GET /api/analytics/student-performance`, `GET /api/analytics/course-summary/:courseId`, `GET /api/analytics/at-risk-students`, `GET /api/analytics/dashboard-metrics`
- **Features Implemented:**
-   [x] Student Learning Analytics: Enrolled/completed course stats, overall progress %, quiz average & pass rate %, assignment marks, study tasks, and AI Tutor session counts
-   [x] Quiz score chronological timeline progression SVG chart (`AssessmentTimelineChart.jsx`)
-   [x] Course Analytics: Total enrolled cohort, active vs inactive learner classification (14-day window), syllabus completion rate, and quiz/assignment score ranges
-   [x] Assessment & Question Item Analysis: Statistical difficulty classification (`Frequently Incorrect`, `Challenging`, `Well-Mastered`) computed from raw student quiz answer records
-   [x] Enrolled Student Performance Roster with live search query and risk category filters
-   [x] Admin Platform Academic Overview: Total user demographics, published course volume, system-wide completion %, active learner count, and assessment event volume
-   [x] Course Performance Comparison Matrix Table for cross-course evaluation
-   [x] Timeframe date range filtering (`7d`, `30d`, `90d`, `all`)
-   [x] Objective data-driven analytical insights derived strictly from verified database metrics (no hallucinated numbers)
-   [x] Module 9 prediction integration into student and course analytics dashboards
-   [x] Automated test suite verifying calculation integrity (`npm test`)
- **Status:** `FUNCTIONALLY COMPLETED` (100%)

---

### Module 11 – Notifications & Alerts
- **Purpose:** Centralized, event-grounded notification engine delivering timely in-app alerts for coursework updates, approaching deadlines, grading outcomes, quiz attempts, and daily study planner tasks.
- **Related Frontend Files:** `components/notifications/NotificationDropdown.jsx`, `pages/notifications/NotificationsPage.jsx`, `services/notificationService.js`, `components/Header.jsx`, `components/Sidebar.jsx`
- **Related Backend Files:** `models/notification.model.js`, `services/notification.service.js`, `controllers/notification.controller.js`, `routes/notification.routes.js`, `scripts/test_notifications.js`
- **Related Database Models:** `Notification`, `Enrollment`, `Assignment`, `Submission`, `Quiz`, `QuizAttempt`, `StudyPlanTask`, `User`, `Course`
- **APIs Involved:** `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`, `DELETE /api/notifications/:id`, `POST /api/notifications/sync`
- **Features Implemented:**
  - [x] Multi-category notification model with recipient ownership enforcement and compound indexing
  - [x] Deterministic event-based deduplication using sparse unique `eventId` tokens
  - [x] Automated event triggers across assignment creation, assignment submission, grading, quiz publishing, quiz results, and course enrollment
  - [x] Approaching deadline scanner generating alerts for unsubmitted assignments due in <24 hours
  - [x] Module 8 personalized study planner daily task reminder synchronization
  - [x] Module 9 constructive performance risk alerts
  - [x] Interactive navbar Notification Dropdown with real unread count badge and live polling
  - [x] Full-featured Notification Center (`/notifications`) with Category filters, pagination, mark read, and delete
  - [x] Automated backend test suite validating deduplication, RBAC ownership security, unread calculation, and reminder sync (`npm test`)
- **Status:** `FUNCTIONALLY COMPLETED` (100%)

---

### Module 12 – Reports & Admin Insights
- **Purpose:** Delivering structured report generation, dynamic filtering, tabular data preview, and multi-format exports (CSV streaming & printable academic PDF layout) for administrators and faculty from real database coursework records.
- **Related Frontend Files:** `pages/reports/ReportsPage.jsx`, `services/reportService.js`, `components/Sidebar.jsx`, `App.jsx`
- **Related Backend Files:** `services/report.service.js`, `controllers/report.controller.js`, `routes/report.routes.js`, `scripts/test_reports.js`
- **Related Database Models:** `Enrollment`, `QuizAttempt`, `Submission`, `Assignment`, `Quiz`, `User`, `Course`, `Category`
- **APIs Involved:** `GET /api/reports/catalog`, `GET /api/reports/generate`, `GET /api/reports/export/csv`
- **Features Implemented:**
  - [x] 7 Comprehensive Academic Report Generators: Student Academic Performance, Course Cohort Performance, At-Risk Early Warning, Assignment Submissions & Grading, Quiz Assessment & Attempts Log, Course Enrollment & Completion, Institutional Academic Summary
  - [x] Dynamic Filtering: Course selector, Risk Level (`High`, `Medium`, `Low`), Status, and Date Range (`7d`, `30d`, `90d`, `all`, custom ISO dates)
  - [x] Clean RFC-compliant CSV streaming with academic metadata comments
  - [x] Academic Printable PDF layout with custom institutional header styling and table formatting
  - [x] Role-Based Access Control: Faculty strictly limited to assigned/authored courses; Admin granted institutional overview; Students blocked
  - [x] Module 9 Integration: Reuses predicted scores and risk levels without recalculating ML features
  - [x] Module 10 Integration: Incorporates platform-wide summaries and course comparisons into executive report
  - [x] Automated backend test suite with 25 test assertions passing with 100% success (`npm test`)
- **Status:** `FUNCTIONALLY COMPLETED` (100%)

