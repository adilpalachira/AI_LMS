# API Inventory - AI-Powered Learning Management System (AI-LMS)

## 1. Master API Endpoint Catalog

All endpoints listed below are mounted under `http://localhost:5000/api`.

### 1.1 Root & System Health APIs
| Method | Endpoint | Purpose | Authentication | Frontend Usage | Backend Implementation | Functional Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | API Root Welcome Message | Public | No | `server.js` | Working |
| `GET` | `/api/health` | Mongoose DB state & collection accessibility check | Public | Optional | `server.js` | Working |

---

### 1.2 Authentication APIs (`/api/auth`)
| Method | Endpoint | Purpose | Authentication | Frontend Usage | Backend Implementation | Functional Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User Registration | Public | `AuthContext.jsx`, `Register.jsx` | `auth.controller.js` | Working |
| `POST` | `/api/auth/login` | User Login & Token Generation | Public | `AuthContext.jsx`, `Login.jsx` | `auth.controller.js` | Working |
| `POST` | `/api/auth/logout` | Client Session Invalidation | Public | `AuthContext.jsx`, `Navbar.jsx` | `auth.controller.js` | Working (Client clear) |
| `POST` | `/api/auth/forgot-password` | Request password reset token | Public | `ForgotPassword.jsx` | `auth.controller.js` | Partial (Mock token) |
| `POST` | `/api/auth/reset-password` | Perform password reset | Public | `ResetPassword.jsx` | `auth.controller.js` | Partial (Mock token) |

---

### 1.3 User Management APIs (`/api/users`)
| Method | Endpoint | Purpose | Authentication | Frontend Usage | Backend Implementation | Functional Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Get current user profile | Protected | `AuthContext.jsx`, `Profile.jsx` | `user.controller.js` | Working |
| `PUT` | `/api/users/profile` | Update profile & upload avatar | Protected | `Profile.jsx` | `user.controller.js` | Working |
| `PUT` | `/api/users/change-password` | Change user password | Protected | `Profile.jsx` | `user.controller.js` | Working |
| `GET` | `/api/users` | List users with search & filters | Admin Only | `admin/Users.jsx` | `user.controller.js` | Working |
| `GET` | `/api/users/:id` | Get user details by ID | Admin Only | `admin/UserDetails.jsx` | `user.controller.js` | Working |
| `POST` | `/api/users` | Administrative user creation | Admin Only | `admin/AddUser.jsx` | `user.controller.js` | Working |
| `PUT` | `/api/users/:id` | Administrative user update | Admin Only | `admin/EditUser.jsx` | `user.controller.js` | Working |
| `DELETE` | `/api/users/:id` | Delete user account | Admin Only | `DeleteUserModal.jsx` | `user.controller.js` | Working |
| `PATCH` | `/api/users/:id/status` | Activate/Deactivate user status | Admin Only | `admin/Users.jsx` | `user.controller.js` | Working |
| `PATCH` | `/api/users/:id/role` | Elevate / change user role | Admin Only | `admin/EditUser.jsx` | `user.controller.js` | Working |
| `PATCH` | `/api/users/:id/reset-password` | Admin force reset user password | Admin Only | `admin/UserDetails.jsx` | `user.controller.js` | Working |

---

### 1.4 Category APIs (`/api/categories`)
| Method | Endpoint | Purpose | Authentication | Frontend Usage | Backend Implementation | Functional Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Get active category list | Protected | `CourseCatalog.jsx`, `CourseForm.jsx` | `category.controller.js` | Working |
| `GET` | `/api/categories/:id` | Get category details | Protected | `admin/Categories.jsx` | `category.controller.js` | Working |
| `POST` | `/api/categories` | Create category | Admin Only | `admin/Categories.jsx` | `category.controller.js` | Working |
| `PUT` | `/api/categories/:id` | Update category details | Admin Only | `admin/Categories.jsx` | `category.controller.js` | Working |
| `DELETE` | `/api/categories/:id` | Delete category | Admin Only | `admin/Categories.jsx` | `category.controller.js` | Working |

---

### 1.5 Course & Enrollment APIs (`/api/courses`)
| Method | Endpoint | Purpose | Authentication | Frontend Usage | Backend Implementation | Functional Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Search & list published courses | Protected | `CourseCatalog.jsx`, `Dashboard.jsx` | `course.controller.js` | Working |
| `GET` | `/api/courses/my-enrollments` | List student enrolled courses | Student Only | `MyCourses.jsx`, `Dashboard.jsx` | `course.controller.js` | Working |
| `GET` | `/api/courses/my-courses` | List faculty taught courses | Admin/Faculty | `ManageCourses.jsx`, `Dashboard.jsx`| `course.controller.js` | Working |
| `GET` | `/api/courses/:id` | Get course details by ID | Protected | `CourseDetail.jsx`, `CourseForm.jsx` | `course.controller.js` | Working |
| `POST` | `/api/courses` | Create course with thumbnail | Admin/Faculty | `CourseForm.jsx` | `course.controller.js` | Working |
| `PUT` | `/api/courses/:id` | Update course details | Admin/Faculty | `CourseForm.jsx` | `course.controller.js` | Working |
| `PATCH` | `/api/courses/:id/publish` | Publish draft course | Admin/Faculty | `ManageCourses.jsx` | `course.controller.js` | Working |
| `PATCH` | `/api/courses/:id/archive` | Archive published course | Admin/Faculty | `ManageCourses.jsx` | `course.controller.js` | Working |
| `DELETE` | `/api/courses/:id` | Delete course | Admin/Faculty | `ManageCourses.jsx` | `course.controller.js` | Working |
| `POST` | `/api/courses/:id/enroll` | Enroll student in course | Student Only | `CourseDetail.jsx` | `course.controller.js` | Working |
| `DELETE` | `/api/courses/:id/enroll` | Unenroll student from course | Student Only | `CourseDetail.jsx` | `course.controller.js` | Working |
| `GET` | `/api/courses/:id/students` | Get enrolled student roster | Admin/Faculty | `CourseDetail.jsx` | `course.controller.js` | Working |

---

### 1.6 Section & Lesson APIs (`/api/sections`, `/api/lessons`, `/api/materials`)
| Method | Endpoint | Purpose | Authentication | Frontend Usage | Backend Implementation | Functional Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/sections` | Get sections by `courseId` | Protected | `ManageCourseContent.jsx`, `LessonViewer` | `section.controller.js` | Working |
| `POST` | `/api/sections` | Create course section | Admin/Faculty | `ManageCourseContent.jsx` | `section.controller.js` | Working |
| `PUT` | `/api/sections/:id` | Update section title/order | Admin/Faculty | `ManageCourseContent.jsx` | `section.controller.js` | Working |
| `DELETE` | `/api/sections/:id` | Delete section | Admin/Faculty | `ManageCourseContent.jsx` | `section.controller.js` | Working |
| `GET` | `/api/lessons` | Get lessons by `sectionId` | Protected | `ManageCourseContent.jsx`, `LessonViewer` | `lesson.controller.js` | Working |
| `GET` | `/api/lessons/:id` | Get lesson details | Protected | `LessonViewer.jsx` | `lesson.controller.js` | Working |
| `POST` | `/api/lessons` | Create lesson | Admin/Faculty | `ManageCourseContent.jsx` | `lesson.controller.js` | Working |
| `PUT` | `/api/lessons/:id` | Update lesson details | Admin/Faculty | `ManageCourseContent.jsx` | `lesson.controller.js` | Working |
| `DELETE` | `/api/lessons/:id` | Delete lesson | Admin/Faculty | `ManageCourseContent.jsx` | `lesson.controller.js` | Working |
| `GET` | `/api/materials/:lessonId` | Get materials for a lesson | Protected | `ManageCourseContent.jsx`, `LessonViewer` | `material.controller.js` | Working |
| `POST` | `/api/materials/upload` | Upload lesson file attachment | Admin/Faculty | `FileUpload.jsx`, `ManageCourseContent` | `material.controller.js` | Working |
| `DELETE` | `/api/materials/:id` | Delete material file | Admin/Faculty | `ManageCourseContent.jsx` | `material.controller.js` | Working |

---

### 1.7 Assignment & Submission APIs (`/api/assignments`, `/api/submissions`)
| Method | Endpoint | Purpose | Authentication | Frontend Usage | Backend Implementation | Functional Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | List assignments (by course) | Protected | `GlobalAssignmentsPage`, `ManageAssignments` | `assignment.controller.js` | Working |
| `GET` | `/api/assignments/:id` | Get assignment details | Protected | `StudentAssignments.jsx` | `assignment.controller.js` | Working |
| `POST` | `/api/assignments` | Create assignment | Admin/Faculty | `ManageAssignments.jsx` | `assignment.controller.js` | Working |
| `PUT` | `/api/assignments/:id` | Update assignment details | Admin/Faculty | `ManageAssignments.jsx` | `assignment.controller.js` | Working |
| `DELETE` | `/api/assignments/:id` | Delete assignment | Admin/Faculty | `ManageAssignments.jsx` | `assignment.controller.js` | Working |
| `POST` | `/api/submissions` | Upload student submission | Student Only | `StudentAssignments.jsx` | `submission.controller.js` | Working |
| `GET` | `/api/submissions` | Get submissions by assignment | Admin/Faculty | `ReviewSubmissions.jsx` | `submission.controller.js` | Working |
| `PUT` | `/api/submissions/:id` | Grade & feedback submission | Admin/Faculty | `ReviewSubmissions.jsx` | `submission.controller.js` | Working |

---

### 1.8 Quiz & Question Bank APIs (`/api/quizzes`, `/api/questions`)
| Method | Endpoint | Purpose | Authentication | Frontend Usage | Backend Implementation | Functional Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/quizzes` | Get quizzes by course | Protected | `ManageQuizzes.jsx`, `StudentQuizzes` | `quiz.controller.js` | Working |
| `GET` | `/api/quizzes/:id` | Get quiz details with questions | Protected | `TakeQuiz.jsx`, `QuizQuestionBuilder` | `quiz.controller.js` | Working |
| `GET` | `/api/quizzes/:id/attempts` | Get quiz attempts | Protected | `StudentQuizzes.jsx` | `quiz.controller.js` | Working |
| `POST` | `/api/quizzes/:id/attempt` | Submit quiz answers | Student Only | `TakeQuiz.jsx` | `quiz.controller.js` | Working |
| `POST` | `/api/quizzes` | Create quiz | Admin/Faculty | `ManageQuizzes.jsx` | `quiz.controller.js` | Working |
| `POST` | `/api/quizzes/:id/questions` | Inject bank questions to quiz | Admin/Faculty | `QuestionBank.jsx`, `QuizQuestionBuilder` | `question.controller.js` | Working |
| `PUT` | `/api/quizzes/:id` | Update quiz settings | Admin/Faculty | `ManageQuizzes.jsx` | `quiz.controller.js` | Working |
| `DELETE` | `/api/quizzes/:id` | Delete quiz | Admin/Faculty | `ManageQuizzes.jsx` | `quiz.controller.js` | Working |
| `GET` | `/api/questions` | Query Question Bank items | Admin/Faculty | `QuestionBank.jsx` | `question.controller.js` | Working |
| `POST` | `/api/questions` | Create question in Bank | Admin/Faculty | `QuestionBank.jsx`, `QuizQuestionBuilder` | `question.controller.js` | Working |
| `PUT` | `/api/questions/:id` | Update question details | Admin/Faculty | `QuestionBank.jsx` | `question.controller.js` | Working |
| `PATCH` | `/api/questions/:id/approve` | Approve draft AI question | Admin/Faculty | `QuestionBank.jsx` | `question.controller.js` | Working |
| `PATCH` | `/api/questions/:id/archive` | Archive question Bank item | Admin/Faculty | `QuestionBank.jsx` | `question.controller.js` | Working |
| `DELETE` | `/api/questions/:id` | Delete question | Admin/Faculty | `QuestionBank.jsx` | `question.controller.js` | Working |

---

### 1.9 AI Tutor & RAG APIs (`/api/ai/tutor`, `/api/ai/knowledge-documents`)
| Method | Endpoint | Purpose | Authentication | Frontend Usage | Backend Implementation | Functional Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/tutor/chat` | Send question & get RAG completion | Protected | `AITutorPage.jsx`, `AIChatWindow` | `aiTutor.controller.js` | Working |
| `POST` | `/api/ai/tutor/sessions` | Create new chat session | Protected | `AITutorPage.jsx` | `aiTutor.controller.js` | Working |
| `GET` | `/api/ai/tutor/sessions` | Get user chat sessions | Protected | `ChatSessionList.jsx` | `aiTutor.controller.js` | Working |
| `GET` | `/api/ai/tutor/sessions/:id` | Get chat history by session ID | Protected | `AITutorPage.jsx` | `aiTutor.controller.js` | Working |
| `DELETE` | `/api/ai/tutor/sessions/:id` | Delete chat session | Protected | `ChatSessionList.jsx` | `aiTutor.controller.js` | Working |
| `GET` | `/api/ai/knowledge-documents` | List RAG document vector status | Admin/Faculty | `AITutorPage.jsx` | `knowledgeDocument.controller.js` | Working |
| `GET` | `/api/ai/knowledge-documents/:id` | Get document processing details | Admin/Faculty | `AITutorPage.jsx` | `knowledgeDocument.controller.js` | Working |
| `POST` | `/api/ai/knowledge-documents/:id/retry` | Retry document vector indexing | Admin/Faculty | `AITutorPage.jsx` | `knowledgeDocument.controller.js` | Working |
| `DELETE` | `/api/ai/knowledge-documents/:id` | Remove document from vector store | Admin/Faculty | `AITutorPage.jsx` | `knowledgeDocument.controller.js` | Working |

---

### 1.10 AI Quiz Generator APIs (`/api/ai/quizzes`)
| Method | Endpoint | Purpose | Authentication | Frontend Usage | Backend Implementation | Functional Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/quizzes/generate` | Synthesize questions via AI | Admin/Faculty | `AIQuizGenerator.jsx` | `aiQuiz.controller.js` | Working |
| `GET` | `/api/ai/quizzes/generation-history`| List AI generation logs | Admin/Faculty | `GenerationHistory.jsx` | `aiQuiz.controller.js` | Working |
| `POST` | `/api/ai/quizzes/bulk-save` | Save approved AI items to Bank | Admin/Faculty | `AIQuizGenerator.jsx` | `aiQuiz.controller.js` | Working |

---

## 2. API Analysis & Recommendations

1. **Unused APIs:** None identified. Every route exposed in Express maps to a corresponding service function in the client.
2. **Missing Backend APIs called by Frontend:** None. All frontend service methods match existing server endpoints.
3. **Inconsistent Request / Response Formats:** Standardized across controllers using `utils/response.js` (`{ success: true, message: "...", data: ... }`).
4. **Duplicate APIs:** None.
