# PROJECT MEMORY — AI-POWERED LEARNING MANAGEMENT SYSTEM (AI-LMS)

## Project Overview
The AI-Powered Learning Management System (AI-LMS) is a full-stack educational platform built with modern web technologies (React, Tailwind CSS, Express.js, MongoDB, Mongoose, and AI/ML services).

---

## Module 10: Intelligent Learning Analytics & Dashboards

### 1. Purpose
Module 10 transforms historical and real-time academic/engagement data collected across Modules 1–9 into visual insights and analytical dashboards. It addresses:
- What has happened across courses and cohorts?
- How are students, courses, and the institution performing?
- What learning patterns and difficulties can be observed?
- Where are students struggling (e.g. Question Item Analysis)?
- How is engagement and course completion evolving over time?

*(Note: Module 10 calculates and analyzes historical data and integrates predictions from Module 9 without duplicating prediction models or recommendation engines).*

---

### 2. Analytics Implemented & Data Sources

| Area | Analytics Metrics Calculated | Data Sources / Models |
| :--- | :--- | :--- |
| **Student Learning Analytics** | Enrolled courses count, completed courses, overall course progress %, quiz average score %, quiz pass rate %, total quiz attempts, assignment average score %, total submissions, late submissions count, AI tutor chat sessions count, study plan tasks completed count & completion rate, quiz score chronological timeline trend, integrated Module 9 grade prediction & risk level. | `Enrollment`, `QuizAttempt`, `Submission`, `Assignment`, `Quiz`, `ChatSession`, `StudyPlanTask`, `User` |
| **Course Analytics** | Total enrolled cohort, active learners (active in last 14 days) vs inactive learners count, course completion rate %, quiz average score %, highest quiz score, lowest quiz score, total quiz attempts, assignment average score %, assignment submission rate %, late submissions count, Question Item Difficulty Analysis (error rates & difficulty tiers), full enrolled student performance roster with search & risk filters. | `Course`, `Enrollment`, `QuizAttempt`, `Question`, `Submission`, `Assignment`, `User` |
| **Assessment & Item Analysis** | Question-level item performance computed from individual student quiz attempt answers: total attempts, incorrect answers count, error rate %, and classification into tiers (`Frequently Incorrect` $\ge 50\%$, `Challenging` $30-49\%$, `Well-Mastered` $<30\%$). | `QuizAttempt`, `Question` |
| **Admin Academic Overview** | Platform-wide totals (users by role: students, faculty, admins; courses and categories; total enrollments and system completion rate; active learners in last 14 days; total quiz attempts and assignment submissions), platform risk distribution breakdown, and course-by-course comparison matrix table. | `User`, `Course`, `Category`, `Enrollment`, `QuizAttempt`, `Submission` |
| **Time-based Filtering** | Dynamic timeframe filtering supporting `7d` (last 7 days), `30d` (last 30 days), `90d` (last 90 days), and `all` (all time). | `createdAt` timestamps |
| **Analytical Insights** | Objective, deterministic natural language summaries derived strictly from computed numbers (no hallucinated statistics). | Real calculated metrics |

---

### 3. API Endpoints

- `GET /api/analytics/student/detailed?timeframe=30d` — Student detailed analytics, KPI cards, timeline, and insights.
- `GET /api/analytics/course/:courseId/detailed?timeframe=30d` — Course analytics, item analysis, and student roster.
- `GET /api/analytics/admin/overview?timeframe=30d` — Platform-wide academic overview, risk distribution, and course comparison matrix.
- `GET /api/analytics/student-performance?courseId=xxx&studentId=yyy` — Module 9 ML predicted grade and feature breakdown.
- `GET /api/analytics/course-summary/:courseId` — Module 9 course risk aggregation.
- `GET /api/analytics/at-risk-students` — Module 9 at-risk student monitoring list.
- `GET /api/analytics/dashboard-metrics` — Quick overview metrics for dashboard headers.

---

### 4. Role-Based Access Control (RBAC)

- **Student**: Accesses only personal learning analytics (`/analytics` defaults to "My Learning Analytics", strictly restricted to authenticated user).
- **Faculty**: Accesses Course Analytics and Question Item Difficulty Analysis for assigned or authored courses (`/analytics` defaults to "Course Analytics" with course selector).
- **Admin**: Has platform-wide access to Academic System Overview, all course comparisons, individual course deep-dives, and student analytics view.

---

### 5. UI Architecture & Components

- **Page**: `client/src/pages/analytics/LearningAnalyticsPage.jsx`
- **Views**:
  - `StudentAnalyticsView.jsx`: KPI summary cards, assessment progression SVG chart, course performance matrix, recent submissions table, and personal insights.
  - `CourseAnalyticsView.jsx`: Course selector, enrollment & activity KPI cards, active vs inactive cohort chart, risk ring chart, item difficulty table, and searchable student roster.
  - `AdminAnalyticsView.jsx`: 5-card system metrics, user composition bar, risk distribution ring chart, searchable course comparison matrix, and platform insights.
- **Components**:
  - `AssessmentTimelineChart.jsx`: Clean, responsive SVG timeline visualizing quiz scores and pass/fail indicators over time.
  - `QuestionDifficultyTable.jsx`: Question error rate and difficulty tier visualization.
  - `TimeframeSelector.jsx`: Clean pill selector for `7d`, `30d`, `90d`, `all`.
  - `AnalyticsInsightsCard.jsx`: Structured data-grounded insights card with contextual warning badges.
  - `PerformanceChart.jsx` & `RiskBadge.jsx`: Gauge, feature bar, risk ring, and risk badge components.

---

### 6. Files Created / Modified

- **Created**:
  - `client/src/pages/analytics/LearningAnalyticsPage.jsx`
  - `client/src/components/analytics/StudentAnalyticsView.jsx`
  - `client/src/components/analytics/CourseAnalyticsView.jsx`
  - `client/src/components/analytics/AdminAnalyticsView.jsx`
  - `client/src/components/analytics/AssessmentTimelineChart.jsx`
  - `client/src/components/analytics/QuestionDifficultyTable.jsx`
  - `client/src/components/analytics/TimeframeSelector.jsx`
  - `client/src/components/analytics/AnalyticsInsightsCard.jsx`
  - `server/scripts/test_analytics.js`
  - `server/scratch/test_module10_analytics.js`
  - `PROJECT_MEMORY.md`

- **Modified**:
  - `server/services/analytics.service.js` (Enhanced with student roster, study activity, AI session tracking, and item analysis)
  - `server/package.json` (Added automated test script)
  - `client/src/services/analyticsService.js` (Added Module 10 API methods)
  - `client/src/App.jsx` (Routed `/analytics` to `LearningAnalyticsPage`)

---

## Module 11: Notifications & Alerts

### 1. Purpose
Module 11 provides a centralized, non-intrusive notification engine that delivers real-time and persistent alerts about academic, learning, performance, and system events across the AI-LMS.

### 2. Notification Types & Categories

| Category | Types | Triggers / Events |
| :--- | :--- | :--- |
| **Academic** | `ASSIGNMENT_CREATED`<br>`ASSIGNMENT_DUE_SOON`<br>`ASSIGNMENT_SUBMITTED`<br>`ASSIGNMENT_GRADED`<br>`QUIZ_AVAILABLE`<br>`QUIZ_RESULT` | • Faculty creates/publishes assignment or quiz<br>• Assignment due in <24h (reminder sync)<br>• Student submits assignment (notifies instructor)<br>• Faculty grades submission (notifies student)<br>• Student completes quiz attempt |
| **Course** | `COURSE_ENROLLED`<br>`COURSE_CONTENT_UPDATED`<br>`COURSE_COMPLETED` | • Student enrolls in course (notifies student & instructor)<br>• New lesson / content published<br>• Syllabus 100% completed |
| **Learning** | `STUDY_PLAN_REMINDER` | • Module 8 study tasks scheduled for today (reminder sync) |
| **Performance** | `PERFORMANCE_RISK` | • Module 9 at-risk indicators suggesting study review |
| **System** | `SYSTEM_ANNOUNCEMENT` | • Platform-wide announcements & updates |

### 3. Notification Model
- **Schema**: `server/models/notification.model.js`
- **Fields**: `recipient` (User ref), `sender` (User ref), `type` (Enum), `title`, `message`, `priority` (`Normal` | `Important`), `relatedEntity`, `relatedEntityType`, `actionUrl`, `isRead` (Boolean), `readAt` (Date), `eventId` (Sparse Unique Key for Deduplication), `createdAt`.
- **Indexes**: Compound index on `{ recipient: 1, isRead: 1, createdAt: -1 }` and unique sparse index on `{ eventId: 1 }`.

### 4. Duplicate Prevention & Reminder Synchronization
- Deduplication is guaranteed using unique event IDs:
  - Assignment deadlines: `DEADLINE_24H_${assignmentId}_${studentId}`
  - Study tasks: `STUDY_TASK_${taskId}_${dateString}`
  - New assignments: `ASSIGNMENT_CREATED_${assignmentId}_${studentId}`
  - New quizzes: `QUIZ_CREATED_${quizId}_${studentId}`
- `notificationService.syncReminders(userId)` dynamically checks approaching deadlines and daily tasks without creating duplicate notifications.

### 5. API Endpoints
- `GET /api/notifications` — Paginated user notifications (supports `page`, `limit`, `isRead`, `type`).
- `GET /api/notifications/unread-count` — Fast count of unread notifications for navbar indicator.
- `PATCH /api/notifications/:id/read` — Mark single notification as read (with recipient ownership verification).
- `PATCH /api/notifications/read-all` — Mark all unread notifications as read.
- `DELETE /api/notifications/:id` — Delete notification.
- `POST /api/notifications/sync` — Synchronize upcoming deadline & study task reminders.

### 6. UI Components
- **Header Dropdown**: `client/src/components/notifications/NotificationDropdown.jsx`
  - Unread count badge on bell icon with periodic polling.
  - Interactive dropdown showing recent notifications, relative timestamps, type icons, mark read, and mark all as read.
- **Dedicated Page**: `client/src/pages/notifications/NotificationsPage.jsx`
  - Full notifications center at `/notifications` with "All" and "Unread" tabs, category filters (Academic, Course, Learning, Performance), batch mark as read, delete, and pagination.

### 7. Files Created / Modified
- **Created**:
  - `server/models/notification.model.js`
  - `server/services/notification.service.js`
  - `server/controllers/notification.controller.js`
  - `server/routes/notification.routes.js`
  - `server/scripts/test_notifications.js`
  - `server/scripts/test_all.js`
  - `client/src/services/notificationService.js`
  - `client/src/components/notifications/NotificationDropdown.jsx`
  - `client/src/pages/notifications/NotificationsPage.jsx`
- **Modified**:
  - `server/server.js` (Registered `/api/notifications`)
  - `server/services/assignment.service.js` (Trigger notification on assignment creation)
  - `server/services/submission.service.js` (Trigger notifications on submission and grading)
  - `server/services/quiz.service.js` (Trigger notifications on quiz creation and quiz completion)
  - `server/services/course.service.js` (Trigger notifications on enrollment)
  - `client/src/components/Header.jsx` (Integrated `NotificationDropdown`)
  - `client/src/components/Sidebar.jsx` (Added Notifications link)
  - `client/src/App.jsx` (Registered `/notifications` route)
  - `server/package.json` (Updated master test runner)

---

## Module 12: Reports & Admin Insights

### 1. Purpose & Objective
Module 12 delivers structured report generation, dynamic filtering, tabular preview, and multi-format exports (CSV streaming & print-ready academic PDF layout) for authorized administrators and faculty. It translates raw MongoDB learning records into audit-grade academic reports without duplicating Module 10's real-time interactive charts or recalculating Module 9's machine learning predictions.

### 2. Supported Report Types & Data Sources

| Report Type | Scope & Description | Source Models / Services |
| :--- | :--- | :--- |
| **Student Academic Performance** | Course progress, quiz averages, assignment scores, late counts, and Module 9 predicted grades. | `Enrollment`, `QuizAttempt`, `Submission`, `analyticsService.calculateStudentPerformance` |
| **Course Cohort Performance** | Enrolled cohort size, syllabus progress %, quiz averages, assignment averages, and at-risk breakdown. | `Course`, `Enrollment`, `analyticsService.getCourseAnalyticsSummary` |
| **At-Risk Student Early Warning** | Actionable intervention rosters highlighting at-risk learners, predicted scores, risk tiers, and primary indicators. | `analyticsService.getAtRiskStudentsList` (Module 9 Integration) |
| **Assignment Submissions & Grading** | Complete audit log of homework submissions, submission timestamps, on-time vs late indicators, and marks. | `Submission`, `Assignment`, `Course`, `User` |
| **Quiz Assessment & Attempts Log** | Granular log of student quiz attempts, attempt numbers, earned marks, percentages, and pass/fail thresholds. | `QuizAttempt`, `Quiz`, `Course`, `User` |
| **Course Enrollment & Completion** | Cohort registration dates, syllabus completion percentages, active vs completed statuses, and timestamps. | `Enrollment`, `Course`, `User` |
| **Institutional Academic Summary** | Executive platform overview with user demographics, platform completion rate %, and cross-course comparisons. | `analyticsService.getAdminSystemAnalytics` (Module 10 Integration) |

### 3. API Endpoints
- `GET /api/reports/catalog` — Get list of available report configurations filtered by user role.
- `GET /api/reports/generate?type=TYPE&courseId=xxx&timeframe=30d&startDate=...&endDate=...` — Generate structured dataset with metadata, KPI summary, column definitions, and data rows.
- `GET /api/reports/export/csv?type=TYPE&courseId=xxx` — Stream clean, escaped CSV document with academic header comments.

### 4. Role-Based Access Control (RBAC)
- **Faculty Access**: Strictly scoped to authorized courses (assigned instructor or course creator). Attempting to query unauthorized courses returns `403 Forbidden`.
- **Admin Access**: Unrestricted platform-wide reporting access including executive institutional summaries, all courses, and cross-cohort comparisons.
- **Students**: Protected from accessing report generation endpoints.

### 5. Export Formats
- **CSV Export**: Backend streaming with RFC-compliant string escaping, academic header metadata, and dynamic filename generation (`type_report_timestamp.csv`).
- **PDF Export**: Clean `@media print` layout with institutional branding, metadata block, KPI summary grid, full tabular records, and page-break optimization.

### 6. Files Created / Modified
- **Created**:
  - `server/services/report.service.js` (Core reporting engine, aggregations, CSV builder)
  - `server/controllers/report.controller.js` (Report controller endpoints)
  - `server/routes/report.routes.js` (Protected RBAC routes)
  - `server/scripts/test_reports.js` (Automated report test suite with 25 test assertions)
  - `client/src/services/reportService.js` (Frontend API service & CSV blob download helper)
  - `client/src/pages/reports/ReportsPage.jsx` (Comprehensive report generation UI)
- **Modified**:
  - `server/server.js` (Mounted `/api/reports`)
  - `server/scripts/test_all.js` (Wired Module 12 tests into comprehensive runner)
  - `client/src/App.jsx` (Registered `/reports` route)
  - `client/src/components/Sidebar.jsx` (Added Reports navigation link for Admin & Faculty)
  - `PROJECT_MEMORY.md` (Updated project memory documentation)

---

## AI Study Planner: Topic-to-Content Deep Linking

### 1. Purpose & Core Objective
Connects daily study planner tasks and topics directly to actual learning materials (exact PDF page numbers, exact video timestamps, focused text notes, quizzes, and assignments) without requiring manual searching or fabricating imaginary locations.

### 2. Resolution Strategy & Reused RAG Architecture
- Reuses existing Module 6 RAG vector search (`vectorStoreService.similaritySearch`) and extracted text metadata (`KnowledgeDocument` / `LearningMaterial` chunks) without duplicate processing pipelines.
- **Resolution Priority**:
  1. **PDF**: Exact document page resolution from verified chunk metadata (`#page=18&toolbar=1&navpanes=0`). If page is unverified, opens the PDF material gracefully without fake page numbers.
  2. **Video**: Exact start timestamp from video metadata/transcripts (`#t=872` or YouTube `&start=872`). If unverified, starts video at the beginning with topic indicator.
  3. **Text Note**: Focuses and highlights keyword matches in the lesson text note.
  4. **Quiz / Assignment**: Navigates directly to assessment screens (`/quizzes/:id/take` or `/courses/:id/student-assignments`).
  5. **Authorization**: Validates student course enrollment before resolving and opening deep links.

### 3. Files Created / Modified
- **Created**:
  - `server/services/topicResolver.service.js` (Core topic resolution engine with authorization and metadata verification)
- **Modified**:
  - `server/models/studyPlanTask.model.js` (Extended with `courseId`, `sectionId`, `lessonId`, `materialId`, `targetLocation`)
  - `server/services/studyPlanner.service.js` (Embedded topic resolution into task generation)
  - `server/controllers/studyPlan.controller.js` (Added `resolveTaskContent` and `resolveTopicContent`)
  - `server/routes/studyPlan.routes.js` (Added `GET /tasks/:id/resolve-content` and `POST /resolve-topic`)
  - `client/src/services/learningService.js` (Added API resolution methods)
  - `client/src/components/learning/StudyTask.jsx` (Dynamic location badges, deep-link navigation, and completion separation)
  - `client/src/pages/courses/LessonViewer.jsx` (Parsed deep link search parameters with active focus banners)
  - `client/src/components/content/FilePreview.jsx` (Propagated deep-link target parameters)
  - `client/src/components/content/PdfViewer.jsx` (Added `#page=X` iframe parameter and badge)
  - `client/src/components/content/VideoPlayer.jsx` (Added `startTime` video seeking and YouTube `&start=X`)

