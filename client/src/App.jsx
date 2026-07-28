import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

// Admin Pages
import UsersPage from './pages/admin/Users';
import AddUser from './pages/admin/AddUser';
import EditUser from './pages/admin/EditUser';
import UserDetails from './pages/admin/UserDetails';
import CategoriesManager from './pages/admin/Categories';

// Course Management Pages
import CourseCatalog from './pages/courses/CourseCatalog';
import CourseDetail from './pages/courses/CourseDetail';
import ManageCourses from './pages/courses/ManageCourses';
import CourseForm from './pages/courses/CourseForm';
import MyCourses from './pages/courses/MyCourses';

// Module 4 Content Management Pages
import ManageCourseContent from './pages/courses/ManageCourseContent';
import LessonViewer from './pages/courses/LessonViewer';

// Module 5 Assessment Pages
import ManageAssignments from './pages/assessment/ManageAssignments';
import ReviewSubmissions from './pages/assessment/ReviewSubmissions';
import ManageQuizzes from './pages/assessment/ManageQuizzes';
import QuizQuestionBuilder from './pages/assessment/QuizQuestionBuilder';
import StudentAssignments from './pages/assessment/StudentAssignments';
import StudentQuizzes from './pages/assessment/StudentQuizzes';
import TakeQuiz from './pages/assessment/TakeQuiz';
import GlobalAssignmentsPage from './pages/assessment/GlobalAssignmentsPage';

// Module 7 AI Quiz Generator & Question Bank Pages
import AIQuizGenerator from './pages/assessment/AIQuizGenerator';
import QuestionBank from './pages/assessment/QuestionBank';
import GenerationHistory from './pages/assessment/GenerationHistory';
import QuizPreview from './pages/assessment/QuizPreview';

// Module 6 AI Tutor Page
import AITutorPage from './pages/ai/AITutorPage';

// Module 8 Personalized Learning & Study Planner Pages
import PersonalizedLearning from './pages/learning/PersonalizedLearning';
import StudyPlannerPage from './pages/learning/StudyPlannerPage';

// Hook
import { useAuth } from './hooks/useAuth';

// Lucide icons for Landing page
import { Sparkles, BrainCircuit, ShieldAlert, Award, ArrowRight } from 'lucide-react';

// Landing Page Sub-component
const LandingPage = () => {
  const { user } = useAuth();
  
  // If user is already authenticated, redirect to /dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-[#F8FAFC] min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center space-y-12">
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 animate-pulse">
          <Sparkles size={12} />
          Empowering Next-Gen Classrooms
        </div>

        {/* Main Hero Header */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-none font-display">
            AI-Powered Learning <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Unlock personalized study paths, intelligent grading pipelines, and interactive AI tutoring tools. Built for Admin control, Faculty ease, and Student success.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-sm group"
          >
            Get Started Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-900 text-gray-600 font-semibold py-3.5 px-8 rounded-xl transition-all shadow-sm"
          >
            View Demo Portal
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 text-left">
          {/* Card 1 */}
          <div className="bg-white border border-gray-200 p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit border border-blue-100">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">AI-Powered Tutoring</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Get instant responses, lecture notes summaries, and personalized revision quizzes dynamically synthesized by intelligent chat assist.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-200/80 p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit border border-indigo-100">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Automated Grading</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Faculty members can run code snippets, score essays, and verify assignments instantly using unified grading structures.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-200 p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-fit border border-rose-100">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Role-based Access</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Distinct dashboard panels designed to keep Admin oversight, Faculty control, and Student spaces securely divided via JWT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component wrapper to access useLocation hook
const AppContent = () => {
  const location = useLocation();
  // Show public top Navbar ONLY on public landing & auth pages
  const isPublicPage = ['/', '/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const showGlobalNavbar = isPublicPage;

  return (
    <div className="flex flex-col min-h-screen">
      {showGlobalNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Secure Protected Dashboard Views */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Administrative User Management (Admin Only) */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin']}>
                  <UsersPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin']}>
                  <AddUser />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id/edit"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin']}>
                  <EditUser />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin']}>
                  <UserDetails />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          {/* Course Management Module Routes */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseCatalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Student']}>
                  <MyCourses />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-courses"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <ManageCourses />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/new"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <CourseForm />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id/edit"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <CourseForm />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin']}>
                  <CategoriesManager />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Module 4 Content Management Routes */}
          <Route
            path="/courses/:id/manage-content"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <ManageCourseContent />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/lessons/:lessonId"
            element={
              <ProtectedRoute>
                <LessonViewer />
              </ProtectedRoute>
            }
          />

          {/* Module 5 Assessment & Assignment Routes */}
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <GlobalAssignmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/assignments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <ManageAssignments />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/student-assignments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Student']}>
                  <StudentAssignments />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments/:id/review"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <ReviewSubmissions />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments/:assignmentId/submit"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Student']}>
                  <StudentAssignments />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/quizzes"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <ManageQuizzes />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/student-quizzes"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Student']}>
                  <StudentQuizzes />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:id/questions"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <QuizQuestionBuilder />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:quizId/take"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Student']}>
                  <TakeQuiz />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Module 6 AI Tutor Route */}
          <Route
            path="/ai-tutor"
            element={
              <ProtectedRoute>
                <AITutorPage />
              </ProtectedRoute>
            }
          />

          {/* Module 8 Personalized Learning & Study Planner Routes */}
          <Route
            path="/personalized-learning"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Student']}>
                  <PersonalizedLearning />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-planner"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Student']}>
                  <StudyPlannerPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Module 7 AI Quiz Generator & Question Bank Routes */}
          <Route
            path="/ai-quiz-generator"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <AIQuizGenerator />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/question-bank"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <QuestionBank />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-generation-history"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <GenerationHistory />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/preview/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Admin', 'Faculty']}>
                  <QuizPreview />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Main Routing App wrapper
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
