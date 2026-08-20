import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import FloatingAIChat from './components/ai/FloatingAIChat';


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
import { Sparkles, BrainCircuit, ShieldAlert, Award, ArrowRight, BookOpen, Clock, Calendar, CheckSquare, Layers, Bot, Zap, CheckCircle } from 'lucide-react';

// Landing Page Sub-component (Redesigned with Black & White Dashboard Theme)
const LandingPage = () => {
  const { user } = useAuth();
  
  // If user is already authenticated, redirect to /dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-[#F8FAFC] min-h-[90vh] font-sans pb-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 text-center space-y-8">
        
        {/* Hero Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-black text-white shadow-sm animate-pulse">
          <Sparkles size={14} className="text-white" />
          <span>Next-Generation AI LMS Platform</span>
        </div>

        {/* Main Hero Header */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.1]">
            AI-Powered Learning <br />
            <span className="text-gray-950">
              Management System
            </span>
          </h1>
          <p className="text-gray-500 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Unlock personalized study paths, intelligent assessment pipelines, and 24/7 AI tutoring tools in a sleek, Notion-inspired dashboard interface.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="flex items-center gap-2.5 bg-black hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-sm group text-sm"
          >
            Get Started Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-950 text-gray-900 font-bold py-3.5 px-8 rounded-xl transition-all shadow-sm text-sm"
          >
            Sign In to Portal
          </Link>
        </div>

        {/* Real Live Dashboard Preview Card Container */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-[24px] p-4 sm:p-6 shadow-md text-left space-y-4 relative overflow-hidden">
            {/* Header Mock bar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                <div className="h-3 w-3 rounded-full bg-gray-900"></div>
                <span className="ml-2 font-bold text-gray-500 text-[11px]">EduAI LMS — Live Dashboard Preview</span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-black text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                <CheckCircle size={12} /> Active Workspace
              </span>
            </div>

            {/* Dashboard Hero Banner Mock */}
            <div className="bg-black text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 max-w-lg">
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Welcome back, Student</span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Today's focus shapes your future.</h2>
                <p className="text-xs text-gray-300 font-medium">Stay consistent with automated study schedules and instant AI feedback.</p>
              </div>
              <Link
                to="/login"
                className="shrink-0 bg-white hover:bg-gray-100 text-black font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                Launch Dashboard
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Grid preview elements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Card 1 */}
              <div className="premium-card space-y-3 !p-5">
                <div className="flex items-center gap-2 text-gray-500">
                  <BookOpen size={15} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Today's Topic</span>
                </div>
                <p className="text-xs font-bold text-gray-950">DBMS — Unit 2</p>
                <h4 className="text-sm font-bold text-gray-900">Database Normalization</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Master 1NF, 2NF, 3NF and BCNF relational principles.</p>
              </div>

              {/* Card 2 */}
              <div className="premium-card space-y-3 !p-5">
                <div className="flex items-center gap-2 text-gray-500">
                  <Bot size={15} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Assistant</span>
                </div>
                <p className="text-xs font-bold text-gray-950">24/7 Academic Tutor</p>
                <h4 className="text-sm font-bold text-gray-900">Instant Explanations</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Ask complex homework questions or code debug requests anytime.</p>
              </div>

              {/* Card 3 */}
              <div className="premium-card space-y-3 !p-5">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={15} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Next Exam</span>
                </div>
                <p className="text-xs font-bold text-gray-950">15 Days Left</p>
                <h4 className="text-sm font-bold text-gray-900">DBMS Internal Exam</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">28 June 2025 • Room 301</p>
              </div>
            </div>

          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 text-left max-w-7xl mx-auto">
          {/* Card 1 */}
          <div className="premium-card p-8 space-y-4">
            <div className="p-3 bg-gray-100 text-gray-950 rounded-2xl w-fit border border-gray-200">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-950">AI-Powered Tutoring</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Get instant responses, lecture summaries, and personalized study paths dynamically synthesized by intelligent chat assist.
            </p>
          </div>

          {/* Card 2 */}
          <div className="premium-card p-8 space-y-4">
            <div className="p-3 bg-gray-100 text-gray-950 rounded-2xl w-fit border border-gray-200">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-950">Automated Assessment</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Faculty members can run code snippets, generate quiz banks, and score assignments using unified grading structures.
            </p>
          </div>

          {/* Card 3 */}
          <div className="premium-card p-8 space-y-4">
            <div className="p-3 bg-gray-100 text-gray-950 rounded-2xl w-fit border border-gray-200">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-950">Role-Based Access</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Tailored dashboards designed to keep Admin oversight, Faculty course control, and Student progress clean and divided.
            </p>
          </div>
        </div>

        {/* Metric Stats Banner */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-sm text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">100%</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Integrated</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">24/7</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tutor Availability</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">3 Roles</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student, Faculty, Admin</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">0 ms</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Instant Feedback</p>
            </div>
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
      <FloatingAIChat />
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
