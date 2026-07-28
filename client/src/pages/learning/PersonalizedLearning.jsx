import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import learningService from '../../services/learningService';
import { getMyEnrollments } from '../../services/courseService';
import LearningPath from '../../components/learning/LearningPath';
import RecommendationCard from '../../components/learning/RecommendationCard';
import WeakTopicCard from '../../components/learning/WeakTopicCard';
import { Sparkles, BrainCircuit, RefreshCw, AlertCircle, BookOpen, CheckCircle } from 'lucide-react';

const PersonalizedLearning = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [learningPathData, setLearningPathData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchLearningPath(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [profRes, recRes, courseRes] = await Promise.all([
        learningService.getProfile(),
        learningService.getRecommendations(),
        getMyEnrollments()
      ]);

      if (profRes.success) setProfile(profRes.data);
      if (recRes.success) setRecommendations(recRes.data);

      const enrollments = courseRes.data || [];
      const courses = enrollments.map(e => e.course || e).filter(Boolean);
      setEnrolledCourses(courses);

      if (courses.length > 0) {
        setSelectedCourseId(courses[0]._id || courses[0].id);
      }
    } catch (err) {
      console.error('[PersonalizedLearning] Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningPath = async (cId) => {
    try {
      const res = await learningService.getLearningPath(cId);
      if (res.success) {
        setLearningPathData(res.data);
      }
    } catch (err) {
      console.error('[PersonalizedLearning] Path fetch error:', err);
    }
  };

  const handleAnalyzePerformance = async () => {
    setAnalyzing(true);
    setMessage('');
    try {
      const res = await learningService.analyzePerformance();
      if (res.success) {
        if (res.data.insufficientData) {
          setMessage(res.data.message);
        } else {
          setMessage('Performance analysis completed! Recommendations updated.');
          setProfile(res.data.profile);
          const updatedRecs = await learningService.getRecommendations();
          if (updatedRecs.success) setRecommendations(updatedRecs.data);
          if (selectedCourseId) fetchLearningPath(selectedCourseId);
        }
      }
    } catch (err) {
      setMessage('Failed to analyze performance.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200/80 p-6 rounded-3xl shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
              <Sparkles size={13} />
              AI Adaptive Learning Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Personalized Learning Path
            </h1>
            <p className="text-sm text-gray-500">
              Tailored learning steps, weak topic insights, and AI recommendations based on your performance.
            </p>
          </div>

          <button
            onClick={handleAnalyzePerformance}
            disabled={analyzing}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
          >
            <RefreshCw size={14} className={analyzing ? 'animate-spin' : ''} />
            {analyzing ? 'Analyzing Performance...' : 'Re-Analyze Performance'}
          </button>
        </div>

        {message && (
          <div className="p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-2xl text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} />
            {message}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-400 font-medium">Loading personalized insights...</div>
        ) : (
          <div className="space-y-8">
            {/* Recommendations Grid */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <BrainCircuit size={18} className="text-blue-600" />
                Active Recommendations
              </h2>

              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((rec) => (
                    <RecommendationCard
                      key={rec._id}
                      recommendation={rec}
                      onAction={() => navigate(`/courses/${rec.courseId?._id || rec.courseId}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-white border border-gray-200/80 rounded-2xl text-center text-xs text-gray-500">
                  No active recommendations. Complete quizzes to unlock adaptive study tips!
                </div>
              )}
            </div>

            {/* Weak Topics Section */}
            {profile?.weakTopics?.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <AlertCircle size={18} className="text-rose-600" />
                  Topics Requiring Attention
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.weakTopics.map((weak, idx) => (
                    <WeakTopicCard
                      key={idx}
                      weakTopic={weak}
                      onStartPractice={() => navigate('/ai-tutor')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Course Selector & Learning Path */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" />
                  Course Learning Path
                </h2>

                {enrolledCourses.length > 0 && (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-blue-600 shadow-xs"
                  >
                    {enrolledCourses.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.title || c.code}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <LearningPath
                pathData={learningPathData}
                onNavigateResource={(resId) => navigate(`/courses/${selectedCourseId}`)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PersonalizedLearning;
