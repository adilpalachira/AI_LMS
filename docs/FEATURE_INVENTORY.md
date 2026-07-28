# Feature Inventory - AI-Powered Learning Management System (AI-LMS)

## 1. Master Feature Matrix

This table indexes all features identified in the codebase, mapped to their respective modules, implementation layer, functional status, and completion percentage.

| Feature Name | Module | Frontend Component / Page | Backend Controller / Route | Database Model | Functional Status | Completion % |
| :--- | :--- | :--- | :--- | :--- | :--- | :-: |
| **System Bootstrap & Health check** | Module 1 | `App.jsx`, `api.js` | `server.js` (`/api/health`) | N/A | Fully integrated | 90% |
| **User Registration** | Module 2 | `Register.jsx` | `auth.controller.js` (`/api/auth/register`) | `User` | Fully integrated | 90% |
| **User Login & JWT Issue** | Module 2 | `Login.jsx` | `auth.controller.js` (`/api/auth/login`) | `User` | Fully integrated | 90% |
| **Client Session & Token Refresh** | Module 2 | `AuthContext.jsx`, `api.js` | `auth.middleware.js` | `User` | Fully integrated | 85% |
| **Role-based Route Guards** | Module 2 | `ProtectedRoute.jsx`, `RoleGuard.jsx` | `role.middleware.js` | `User` | Fully integrated | 90% |
| **Forgot & Reset Password** | Module 2 | `ForgotPassword.jsx`, `ResetPassword.jsx` | `auth.controller.js` | `User` | Frontend + Backend (Mock Token) | 60% |
| **User Profile Management** | Module 3 | `Profile.jsx` | `user.controller.js` (`/api/users/profile`) | `User` | Fully integrated | 90% |
| **Profile Photo Upload** | Module 3 | `Profile.jsx` | `upload.middleware.js` | `User` | Fully integrated | 85% |
| **Admin User List & Search** | Module 3 | `admin/Users.jsx`, `UserTable.jsx` | `user.controller.js` (`GET /api/users`) | `User` | Fully integrated | 90% |
| **Admin Create & Edit User** | Module 3 | `admin/AddUser.jsx`, `admin/EditUser.jsx` | `user.controller.js` | `User` | Fully integrated | 90% |
| **Admin Delete & Status Change** | Module 3 | `DeleteUserModal.jsx` | `user.controller.js` (`PATCH /status`) | `User` | Fully integrated | 90% |
| **Category Management** | Module 4 | `admin/Categories.jsx` | `category.controller.js` | `Category` | Fully integrated | 85% |
| **Course Catalog & Filtering** | Module 4 | `CourseCatalog.jsx`, `CourseFilter.jsx` | `course.controller.js` (`GET /api/courses`)| `Course` | Fully integrated | 90% |
| **Course Creation & Editing** | Module 4 | `CourseForm.jsx`, `ManageCourses.jsx` | `course.controller.js`, `courseUpload` | `Course` | Fully integrated | 85% |
| **Course Thumbnail Upload** | Module 4 | `CourseForm.jsx` | `courseUpload.middleware.js` | `Course` | Fully integrated | 85% |
| **Course Publishing & Archiving** | Module 4 | `ManageCourses.jsx` | `course.controller.js` (`PATCH /publish`)| `Course` | Fully integrated | 90% |
| **Student Course Enrollment** | Module 4 | `CourseDetail.jsx`, `MyCourses.jsx` | `course.controller.js` (`POST /enroll`) | `Enrollment`, `Course` | Fully integrated | 90% |
| **Course Enrolled Students Roster**| Module 4 | `CourseDetail.jsx` | `course.controller.js` (`GET /students`)| `Enrollment`, `User` | Fully integrated | 85% |
| **Course Ratings & Reviews** | Module 4 | `CourseDetail.jsx` (Display only) | Schema fields exist (`rating`) | `Course` | UI / Schema only | 30% |
| **Course Section Management** | Module 5 | `ManageCourseContent.jsx`, `SectionCard.jsx` | `section.controller.js` | `CourseSection` | Fully integrated | 85% |
| **Lesson Creation & Reordering** | Module 5 | `ManageCourseContent.jsx`, `LessonCard.jsx` | `lesson.controller.js` | `Lesson` | Fully integrated | 85% |
| **Lesson Material Attachment** | Module 5 | `FileUpload.jsx`, `DocumentCard.jsx` | `material.controller.js`, `contentUpload` | `LearningMaterial` | Fully integrated | 85% |
| **Interactive Lesson Viewer** | Module 5 | `LessonViewer.jsx`, `PdfViewer.jsx`, `VideoPlayer.jsx` | `lesson.controller.js`, `material.controller.js` | `Lesson`, `LearningMaterial` | Fully integrated | 85% |
| **Lesson Progress Tracking** | Module 5 | `ProgressIndicator.jsx` | Frontend dynamic calculation | `Enrollment` | Frontend + Backend | 60% |
| **Assignment Creation & Controls** | Module 6 | `ManageAssignments.jsx` | `assignment.controller.js` | `Assignment` | Fully integrated | 85% |
| **Student Assignment Upload** | Module 6 | `StudentAssignments.jsx` | `submission.controller.js`, `submissionUpload` | `Submission` | Fully integrated | 85% |
| **Faculty Submission Grading** | Module 6 | `ReviewSubmissions.jsx`, `SubmissionCard.jsx` | `submission.controller.js` (`PUT /:id`) | `Submission` | Fully integrated | 85% |
| **Quiz Creation & Question Builder**| Module 6 | `ManageQuizzes.jsx`, `QuizQuestionBuilder.jsx` | `quiz.controller.js`, `question.controller.js` | `Quiz`, `Question` | Fully integrated | 85% |
| **Student Quiz Taking Engine** | Module 6 | `StudentQuizzes.jsx`, `TakeQuiz.jsx`, `Timer.jsx` | `quiz.controller.js` (`POST /attempt`) | `QuizAttempt`, `Quiz` | Fully integrated | 85% |
| **Descriptive Quiz Answer Grading**| Module 6 | `TakeQuiz.jsx` | Auto-graded as 0 | `QuizAttempt` | Partially integrated | 40% |
| **PDF Processing & Text Chunking** | Module 7 | `DocumentStatusBadge.jsx` | `documentProcessor.service.js`, `textChunker.service.js` | `KnowledgeDocument` | Fully integrated | 80% |
| **Vector Embedding & Store Upsert**| Module 7 | `DocumentStatusBadge.jsx` | `embedding.service.js`, `vectorStore.service.js` | `KnowledgeDocument` | Fully integrated | 80% |
| **RAG AI Tutor Chat Engine** | Module 7 | `AITutorPage.jsx`, `AIChatWindow.jsx`, `ChatMessage.jsx` | `aiTutor.controller.js`, `rag.service.js` | `ChatSession`, `ChatMessage` | Fully integrated | 80% |
| **AI Tutor Source Citation** | Module 7 | `SourceReference.jsx` | `aiTutor.controller.js` | `ChatMessage` | Fully integrated | 85% |
| **AI Tutor Fallback Engine** | Module 7 | `AIChatWindow.jsx` | `openai.service.js` | N/A | Fully integrated | 90% |
| **AI Quiz Generation Engine** | Module 8 | `AIQuizGenerator.jsx` | `aiQuiz.controller.js`, `quizGenerator.service.js` | `QuizGenerationHistory` | Fully integrated | 80% |
| **Question Bank Governance** | Module 8 | `QuestionBank.jsx` | `question.controller.js` | `Question` | Fully integrated | 85% |
| **Inject Bank Questions to Quiz**| Module 8 | `QuestionBank.jsx`, `QuizQuestionBuilder.jsx` | `question.controller.js` (`POST /questions`) | `Quiz`, `Question` | Fully integrated | 80% |
| **Role-based Dashboards** | Module 9 | `Dashboard.jsx` | Aggregated controller calls | `User`, `Course`, `Submission` | Fully integrated | 75% |
| **PDF Analytics Report Export** | Module 9 | Root `generate_pdf.py` | Python script in root | N/A | Backend only / Script | 40% |
| **Centralized Error Handler** | Module 10| N/A | `error.middleware.js` | N/A | Backend only | 90% |
| **Automated Test Suite** | Module 10| N/A | None | N/A | Missing | 0% |

---

## 2. Status Classification Summary

- **Fully Integrated (Frontend + Backend + DB Working):** 31 Features
- **Frontend + Backend (Partial / Mocked Data):** 4 Features
- **UI / Schema Only:** 2 Features
- **Backend / Script Only:** 2 Features
- **Missing:** 3 Features
