# Authentication & Role Authorization - AI-Powered Learning Management System (AI-LMS)

## 1. Authentication Architecture

The AI-Powered LMS implements a **JSON Web Token (JWT)** stateless authentication architecture with role-based authorization guards on both the client and server.

```text
+----------------+              +-----------------+              +------------------+
| Client Browser |              | Express Server  |              | MongoDB Database |
+-------+--------+              +--------+--------+              +--------+---------+
        |                                |                                |
        | 1. POST /api/auth/login        |                                |
        |------------------------------->|                                |
        |                                | 2. Query User (select password)|
        |                                |------------------------------->|
        |                                |<-------------------------------|
        |                                | 3. Compare Bcrypt Hash         |
        |                                | 4. Issue JWT Access & Refresh  |
        | 5. Return Tokens & User Data   |                                |
        |<-------------------------------|                                |
        |                                |                                |
        | 6. HTTP Request + Bearer Token |                                |
        |------------------------------->| 7. Protect Middleware Verify   |
        |                                | 8. RoleGuard Middleware Verify |
        | 9. HTTP 200 OK JSON Data       |                                |
        |<-------------------------------|                                |
```

---

## 2. Token & Session Management

- **Access Token:** Short-lived JWT (`expiresIn: 2h`) signed with `JWT_SECRET`. Contains payload: `{ id: user._id, role: user.role }`.
- **Refresh Token:** Long-lived JWT (`expiresIn: 7d`) signed with `JWT_REFRESH_SECRET`.
- **Client Storage:** `localStorage` holds `accessToken`, `refreshToken`, and JSON stringified `user` object.
- **Request Authorization Header:** Sent as `Authorization: Bearer <accessToken>` via Axios request interceptor (`client/src/services/api.js`).
- **Session Auto-Clear & Expiration:** Axios response interceptor catches HTTP `401 Unauthorized` responses, clears local storage tokens, and redirects user to `/login?expired=true`.
- **Password Security:** Hashes passwords using `bcryptjs` with 10 salt rounds (`server/services/password.service.js`). Password field is excluded from default queries via `select: false` on `User` schema.

---

## 3. Role-Permission Matrix

The application supports three explicit roles: **`Admin`**, **`Faculty`**, and **`Student`**.

| Feature / Resource Action | Admin | Faculty | Student |
| :--- | :---: | :---: | :---: |
| **Public Landing & Register / Login** | Yes | Yes | Yes |
| **View Own User Profile & Upload Photo** | Yes | Yes | Yes |
| **Change Own Password** | Yes | Yes | Yes |
| **Access General Dashboard** | Yes | Yes | Yes |
| **Browse Published Course Catalog & Detail** | Yes | Yes | Yes |
| **Enroll / Unenroll in Courses** | No | No | **Yes** |
| **View My Enrolled Courses (`/my-courses`)** | No | No | **Yes** |
| **View Lessons & Materials (`LessonViewer`)** | Yes | Yes | Yes |
| **Submit Assignments (`/submit`)** | No | No | **Yes** |
| **Take Online Quizzes & Auto-Grade (`/take`)** | No | No | **Yes** |
| **Access RAG AI Tutor Workspace (`/ai-tutor`)**| Yes | Yes | Yes |
| **Create & Edit Courses (`/courses/new`)** | **Yes** | **Yes** | No |
| **Publish / Archive Courses** | **Yes** | **Yes** | No |
| **Manage Course Content (Sections/Lessons/Files)**| **Yes** | **Yes** | No |
| **Create & Delete Assignments** | **Yes** | **Yes** | No |
| **Review & Grade Student Submissions** | **Yes** | **Yes** | No |
| **Create & Edit Manual Quizzes** | **Yes** | **Yes** | No |
| **Build & Manage Quiz Questions** | **Yes** | **Yes** | No |
| **Run AI Quiz Generator** | **Yes** | **Yes** | No |
| **Access & Govern Smart Question Bank** | **Yes** | **Yes** | No |
| **View AI RAG Knowledge Document Status** | **Yes** | **Yes** | No |
| **Retry / Remove RAG Vector Documents** | **Yes** | **Yes** | No |
| **Administrative User Management (`/admin/users`)**| **Yes (Admin Only)** | No | No |
| **Create, Edit & Delete Users** | **Yes (Admin Only)** | No | No |
| **Toggle User Status (`Active`/`Inactive`)** | **Yes (Admin Only)** | No | No |
| **Elevate / Update User Roles** | **Yes (Admin Only)** | No | No |
| **Force Reset User Password** | **Yes (Admin Only)** | No | No |
| **Manage Categories (`/admin/categories`)**| **Yes (Admin Only)** | No | No |

---

## 4. Protected Route & Role Enforcement

### 4.1 Server-Side Middleware Enforcement
- **`protect` (`server/middlewares/auth.middleware.js`):** Extracts Bearer token from header, verifies JWT signature, attaches decoded user object (`req.user`) to Express request.
- **`authorizeRoles(...roles)` (`server/middlewares/role.middleware.js`):** Checks if `req.user.role` is included in allowed roles array. If authorized, passes control to next handler; otherwise returns HTTP `403 Forbidden`.

### 4.2 Client-Side Route Enforcement
- **`ProtectedRoute` (`client/src/components/ProtectedRoute.jsx`):** Wraps protected routes. If `AuthContext` has no active user, redirects to `/login` with location state preserved.
- **`RoleGuard` (`client/src/components/RoleGuard.jsx`):** Accepts `allowedRoles` array. If authenticated user's role is not allowed, renders a clean unauthorized warning view with a button back to `/dashboard`.
