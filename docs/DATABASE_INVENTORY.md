# Database Inventory - AI-Powered Learning Management System (AI-LMS)

## 1. Database Overview

**Database Engine:** MongoDB  
**Object Data Modeling (ODM):** Mongoose v8.4.1  
**Database Name:** `ai-lms`  
**Connection URI:** `mongodb://127.0.0.1:27017/ai-lms`  
**Total Collections / Schemas:** 16 Mongoose Schemas

---

## 2. Comprehensive Model & Schema Inventory

### 2.1 `User` Schema
- **File:** `server/models/user.model.js`
- **Fields:**
  - `_id` (`ObjectId`, Auto-generated)
  - `name` (`String`, Required, Trimmed)
  - `email` (`String`, Required, Unique, Lowercase, Trimmed, RegEx Validated)
  - `password` (`String`, Required, Min 8 chars, `select: false`)
  - `role` (`String`, Enum: `['Admin', 'Faculty', 'Student']`, Default: `'Student'`)
  - `phone` (`String`, Default: `''`)
  - `profileImage` (`String`, Default: `''`)
  - `status` (`String`, Enum: `['Active', 'Inactive']`, Default: `'Active'`)
  - `lastLogin` (`Date`)
  - `isVerified` (`Boolean`, Default: `false`)
  - `resetPasswordToken` (`String`)
  - `resetPasswordExpire` (`Date`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Used by Modules:** Module 2 (Auth), Module 3 (Users), Module 4 (Courses), Module 6 (Assessment), Module 7 (AI Tutor), Module 8 (AI Quiz)
- **CRUD Operations:** Create (Register/Admin), Read (Profile/Users), Update (Profile/Status/Role), Delete (Admin User Delete)

---

### 2.2 `Category` Schema
- **File:** `server/models/category.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `name` (`String`, Required, Unique, Max 50 chars)
  - `slug` (`String`, Unique, Auto-generated lowercase slug)
  - `description` (`String`, Max 250 chars)
  - `icon` (`String`, Default: `'BookOpen'`)
  - `status` (`String`, Enum: `['Active', 'Inactive']`, Default: `'Active'`)
  - `createdBy` (`ObjectId`, Ref: `'User'`, Required)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Used by Modules:** Module 4 (Course & Category Management)
- **CRUD Operations:** Create (Admin), Read (All), Update (Admin), Delete (Admin)

---

### 2.3 `Course` Schema
- **File:** `server/models/course.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `title` (`String`, Required, Max 120 chars)
  - `slug` (`String`, Unique, Auto-generated lowercase slug)
  - `code` (`String`, Required, Unique, Uppercase)
  - `shortDescription` (`String`, Required, Max 300 chars)
  - `fullDescription` (`String`, Required)
  - `category` (`ObjectId`, Ref: `'Category'`, Required)
  - `level` (`String`, Enum: `['Beginner', 'Intermediate', 'Advanced']`, Default: `'Beginner'`)
  - `duration` (`String`, Default: `'Self-Paced'`)
  - `language` (`String`, Default: `'English'`)
  - `thumbnail` (`String`, Default: `''`)
  - `instructor` (`ObjectId`, Ref: `'User'`, Required)
  - `status` (`String`, Enum: `['Draft', 'Published', 'Archived']`, Default: `'Draft'`)
  - `tags` (`[String]`)
  - `learningOutcomes` (`[String]`)
  - `prerequisites` (`[String]`)
  - `enrolledCount` (`Number`, Default: `0`)
  - `rating` (`Number`, Default: `0`)
  - `totalRatings` (`Number`, Default: `0`)
  - `createdBy` (`ObjectId`, Ref: `'User'`, Required)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Text Index on `(title, code, shortDescription)`, Index on `(category, level, status)`, Index on `(instructor)`
- **Used by Modules:** Module 4 (Courses), Module 5 (Content), Module 6 (Assessment), Module 7 (AI Tutor), Module 8 (AI Quiz)
- **CRUD Operations:** Create (Faculty/Admin), Read (Catalog/Details), Update (Faculty/Admin), Delete (Faculty/Admin)

---

### 2.4 `CourseSection` Schema
- **File:** `server/models/section.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `courseId` (`ObjectId`, Ref: `'Course'`, Required)
  - `title` (`String`, Required, Max 150 chars)
  - `order` (`Number`, Default: `0`)
  - `description` (`String`, Default: `''`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Compound Index on `(courseId, order)`
- **Used by Modules:** Module 5 (Content Management)
- **CRUD Operations:** Create (Faculty/Admin), Read (By Course), Update (Faculty/Admin), Delete (Faculty/Admin)

---

### 2.5 `Lesson` Schema
- **File:** `server/models/lesson.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `courseId` (`ObjectId`, Ref: `'Course'`, Required)
  - `sectionId` (`ObjectId`, Ref: `'CourseSection'`, Required)
  - `title` (`String`, Required, Max 200 chars)
  - `description` (`String`)
  - `duration` (`String`, Default: `'10 mins'`)
  - `order` (`Number`, Default: `0`)
  - `contentType` (`String`, Enum: `['PDF', 'PowerPoint', 'Word Document', 'Image', 'Video', 'YouTube', 'External URL', 'Text Note']`, Required)
  - `isPreview` (`Boolean`, Default: `false`)
  - `textNote` (`String`)
  - `externalUrl` (`String`)
  - `summary` (`String`)
  - `aiMetadata` (`Object`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Compound Index on `(sectionId, order)`, Index on `(courseId)`
- **Used by Modules:** Module 5 (Content), Module 7 (AI Tutor), Module 8 (AI Quiz)
- **CRUD Operations:** Create (Faculty/Admin), Read (By Section/ID), Update (Faculty/Admin), Delete (Faculty/Admin)

---

### 2.6 `LearningMaterial` Schema
- **File:** `server/models/material.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `lessonId` (`ObjectId`, Ref: `'Lesson'`, Required)
  - `courseId` (`ObjectId`, Ref: `'Course'`, Required)
  - `fileName` (`String`, Required)
  - `fileType` (`String`, Required)
  - `fileUrl` (`String`, Required)
  - `fileSize` (`Number`, Default: `0`)
  - `mimeType` (`String`)
  - `uploadedBy` (`ObjectId`, Ref: `'User'`, Required)
  - `extractedText` (`String`)
  - `aiMetadata` (`Object`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Index on `(lessonId)`, Index on `(courseId)`
- **Used by Modules:** Module 5 (Content), Module 7 (AI Tutor RAG Document Indexing)
- **CRUD Operations:** Create (Upload Material), Read (By Lesson), Delete (Faculty/Admin)

---

### 2.7 `Enrollment` Schema
- **File:** `server/models/enrollment.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `student` (`ObjectId`, Ref: `'User'`, Required)
  - `course` (`ObjectId`, Ref: `'Course'`, Required)
  - `status` (`String`, Enum: `['Active', 'Completed', 'Dropped']`, Default: `'Active'`)
  - `progress` (`Number`, Min: `0`, Max: `100`, Default: `0`)
  - `enrollmentDate` (`Date`, Default: `Date.now`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Unique Compound Index on `(student, course)`
- **Used by Modules:** Module 4 (Course Enrollment & My Courses)
- **CRUD Operations:** Create (Enroll), Read (My Enrollments / Course Students Roster), Delete (Unenroll)

---

### 2.8 `Assignment` Schema
- **File:** `server/models/assignment.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `courseId` (`ObjectId`, Ref: `'Course'`, Required)
  - `title` (`String`, Required, Max 200 chars)
  - `description` (`String`)
  - `instructions` (`String`)
  - `maxMarks` (`Number`, Default: `100`, Min: `1`)
  - `deadline` (`Date`, Required)
  - `allowedFileTypes` (`[String]`, Default: `['pdf', 'doc', 'docx', 'zip', 'png', 'jpg']`)
  - `maxFileSizeMB` (`Number`, Default: `25`)
  - `lateSubmissionPolicy` (`String`, Enum: `['Allowed', 'Disallowed', 'DeductMarks']`, Default: `'Allowed'`)
  - `status` (`String`, Enum: `['Draft', 'Published', 'Archived']`, Default: `'Published'`)
  - `createdBy` (`ObjectId`, Ref: `'User'`, Required)
  - `aiGradingPrompt`, `aiRubric`, `aiDifficulty` (`AI Assessment Fields`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Index on `(courseId, deadline)`
- **Used by Modules:** Module 6 (Assessment & Submissions)
- **CRUD Operations:** Create (Faculty/Admin), Read (By Course/Global), Update (Faculty/Admin), Delete (Faculty/Admin)

---

### 2.9 `Submission` Schema
- **File:** `server/models/submission.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `assignmentId` (`ObjectId`, Ref: `'Assignment'`, Required)
  - `courseId` (`ObjectId`, Ref: `'Course'`, Required)
  - `studentId` (`ObjectId`, Ref: `'User'`, Required)
  - `fileUrl` (`String`, Required)
  - `fileName` (`String`)
  - `fileSize` (`Number`, Default: `0`)
  - `submittedAt` (`Date`, Default: `Date.now`)
  - `isLate` (`Boolean`, Default: `false`)
  - `marks` (`Number`, Default: `null`)
  - `feedback` (`String`, Default: `''`)
  - `status` (`String`, Enum: `['Submitted', 'Graded', 'Resubmitted']`, Default: `'Submitted'`)
  - `gradedBy` (`ObjectId`, Ref: `'User'`)
  - `gradedAt` (`Date`)
  - `aiGradedScore`, `aiFeedback`, `aiConfidence` (`AI Automated Prep`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Compound Index on `(assignmentId, studentId)`, Index on `(courseId)`
- **Used by Modules:** Module 6 (Submissions & Grading)
- **CRUD Operations:** Create (Student Submit), Read (By Assignment/Student), Update (Faculty Grade)

---

### 2.10 `Quiz` Schema
- **File:** `server/models/quiz.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `courseId` (`ObjectId`, Ref: `'Course'`, Required)
  - `title` (`String`, Required, Max 200 chars)
  - `description` (`String`)
  - `durationMinutes` (`Number`, Default: `30`, Min: `1`)
  - `passingMarks` (`Number`, Default: `50`)
  - `maxAttempts` (`Number`, Default: `1`, Min: `1`)
  - `shuffleQuestions` (`Boolean`, Default: `false`)
  - `shuffleOptions` (`Boolean`, Default: `false`)
  - `status` (`String`, Enum: `['Draft', 'Published', 'Archived']`, Default: `'Published'`)
  - `createdBy` (`ObjectId`, Ref: `'User'`, Required)
  - `aiGenerated` (`Boolean`, Default: `false`)
  - `aiTopic` (`String`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Index on `(courseId, status)`
- **Used by Modules:** Module 6 (Quizzes & Question Builder), Module 8 (AI Quiz Generator)
- **CRUD Operations:** Create (Faculty/Admin), Read (By Course/ID), Update (Faculty/Admin), Delete (Faculty/Admin)

---

### 2.11 `Question` Schema
- **File:** `server/models/question.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `quizId` (`ObjectId`, Ref: `'Quiz'`, Optional)
  - `question` (`String`, Required)
  - `type` (`String`, Enum: `['Multiple Choice', 'MCQ', 'True/False', 'Short Answer', 'Essay', 'Descriptive']`, Required)
  - `options` (`[String]`)
  - `correctAnswer` (`Mixed`, Required)
  - `explanation` (`String`)
  - `marks` (`Number`, Default: `1`, Min: `1`)
  - `order` (`Number`, Default: `0`)
  - `courseId` (`ObjectId`, Ref: `'Course'`)
  - `lessonId` (`ObjectId`, Ref: `'Lesson'`)
  - `materialId` (`ObjectId`, Ref: `'LearningMaterial'`)
  - `createdBy` (`ObjectId`, Ref: `'User'`)
  - `status` (`String`, Enum: `['Generated', 'Draft', 'Approved', 'Archived']`, Default: `'Approved'`)
  - `isAiGenerated` (`Boolean`, Default: `false`)
  - `source` (`String`)
  - `sourcePage` (`Mixed`)
  - `difficulty` (`String`, Enum: `['Easy', 'Medium', 'Hard']`, Default: `'Medium'`)
  - `aiEvaluationCriteria` (`String`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Compound Index on `(quizId, order)`, Index on `(courseId, status)`, Index on `(status)`
- **Used by Modules:** Module 6 (Quiz Questions), Module 8 (Smart Question Bank)
- **CRUD Operations:** Create (Manual/AI Bulk-Save), Read (Question Bank/Quiz view), Update (Faculty/Admin), Patch (Approve/Archive), Delete (Faculty/Admin)

---

### 2.12 `QuizAttempt` Schema
- **File:** `server/models/quizAttempt.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `quizId` (`ObjectId`, Ref: `'Quiz'`, Required)
  - `courseId` (`ObjectId`, Ref: `'Course'`, Required)
  - `studentId` (`ObjectId`, Ref: `'User'`, Required)
  - `score` (`Number`, Default: `0`)
  - `maxScore` (`Number`, Default: `0`)
  - `percentage` (`Number`, Default: `0`)
  - `passed` (`Boolean`, Default: `false`)
  - `answers` (`[{ questionId: ObjectId, studentAnswer: Mixed, isCorrect: Boolean, marksAwarded: Number, feedback: String }]`)
  - `startedAt` (`Date`, Default: `Date.now`)
  - `submittedAt` (`Date`)
  - `attemptNumber` (`Number`, Default: `1`)
  - `status` (`String`, Enum: `['In-Progress', 'Completed']`, Default: `'Completed'`)
  - `aiEvaluationSummary`, `aiSkillGapAnalysis` (`AI Feedback Prep`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Compound Index on `(quizId, studentId)`
- **Used by Modules:** Module 6 (Student Quiz Attempt & Scoring)
- **CRUD Operations:** Create (Submit Quiz Attempt), Read (Student Attempts)

---

### 2.13 `KnowledgeDocument` Schema
- **File:** `server/models/knowledgeDocument.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `courseId` (`ObjectId`, Ref: `'Course'`, Required)
  - `lessonId` (`ObjectId`, Ref: `'Lesson'`, Required)
  - `materialId` (`ObjectId`, Ref: `'LearningMaterial'`, Required)
  - `fileName` (`String`, Required)
  - `fileType` (`String`, Required)
  - `sourceUrl` (`String`, Required)
  - `processingStatus` (`String`, Enum: `['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']`, Default: `'PENDING'`)
  - `chunkCount` (`Number`, Default: `0`)
  - `embeddingStatus` (`String`, Enum: `['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED']`, Default: `'NOT_STARTED'`)
  - `errorMessage` (`String`)
  - `createdBy` (`ObjectId`, Ref: `'User'`, Required)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Unique Compound Index on `(courseId, materialId)`, Index on `(processingStatus)`
- **Used by Modules:** Module 7 (AI Tutor RAG Document Indexing)
- **CRUD Operations:** Create (Material Upload Trigger), Read (Faculty RAG Dashboard), Update (Retry Vectorizing), Delete (Remove Vector Document)

---

### 2.14 `ChatSession` Schema
- **File:** `server/models/chatSession.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `studentId` (`ObjectId`, Ref: `'User'`, Required)
  - `courseId` (`ObjectId`, Ref: `'Course'`, Required)
  - `title` (`String`, Required, Default: `'New Conversation'`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Compound Index on `(studentId, courseId)`
- **Used by Modules:** Module 7 (AI Tutor Session History)
- **CRUD Operations:** Create (New Chat Session), Read (User Sessions), Delete (Delete Session)

---

### 2.15 `ChatMessage` Schema
- **File:** `server/models/chatMessage.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `sessionId` (`ObjectId`, Ref: `'ChatSession'`, Required)
  - `role` (`String`, Enum: `['user', 'assistant']`, Required)
  - `content` (`String`, Required)
  - `sources` (`[{ fileName: String, lessonName: String, materialId: String, chunkId: String, pageNumber: Number, score: Number }]`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Compound Index on `(sessionId, createdAt)`
- **Used by Modules:** Module 7 (AI Tutor Messages & Source Grounding)
- **CRUD Operations:** Create (Append Message / AI Response), Read (By Session ID)

---

### 2.16 `QuizGenerationHistory` Schema
- **File:** `server/models/quizGenerationHistory.model.js`
- **Fields:**
  - `_id` (`ObjectId`)
  - `createdBy` (`ObjectId`, Ref: `'User'`, Required)
  - `courseId` (`ObjectId`, Ref: `'Course'`, Required)
  - `lessonId` (`ObjectId`, Ref: `'Lesson'`, Default: `null`)
  - `materialId` (`ObjectId`, Ref: `'LearningMaterial'`, Default: `null`)
  - `topic` (`String`)
  - `questionType` (`String`, Default: `'MCQ'`)
  - `difficulty` (`String`, Enum: `['Easy', 'Medium', 'Hard']`, Default: `'Medium'`)
  - `questionCount` (`Number`, Default: `5`)
  - `status` (`String`, Enum: `['PENDING', 'GENERATING', 'COMPLETED', 'FAILED']`, Default: `'PENDING'`)
  - `generatedQuestions` (`[{ question, type, difficulty, options, correctAnswer, explanation, marks, source, sourcePage }]`)
  - `generatedQuestionIds` (`[{ type: ObjectId, ref: 'Question' }]`)
  - `errorMessage` (`String`)
  - `completedAt` (`Date`)
  - `createdAt`, `updatedAt` (`Timestamps`)
- **Indexes:** Compound Index on `(createdBy, createdAt)`, Index on `(courseId)`
- **Used by Modules:** Module 8 (AI Quiz Generator History Logs)
- **CRUD Operations:** Create (On Generate Request), Read (History Page), Update (Bulk Save mapping)
