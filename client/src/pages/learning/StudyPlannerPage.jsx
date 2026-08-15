import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import learningService from '../../services/learningService';
import { getMyEnrollments } from '../../services/courseService';
import StudyTask from '../../components/learning/StudyTask';
import StudyCalendar from '../../components/learning/StudyCalendar';
import StudyPlanFormModal from '../../components/learning/StudyPlanFormModal';
import { CalendarRange, Sparkles, Plus, Trash2, Clock, CheckCircle2, AlertCircle, Target, BookOpen } from 'lucide-react';

const StudyPlannerPage = () => {
  const [studyPlans, setStudyPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState('All');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [plansRes, courseRes] = await Promise.all([
        learningService.getStudyPlans(),
        getMyEnrollments()
      ]);

      if (plansRes.success && Array.isArray(plansRes.data)) {
        setStudyPlans(plansRes.data);
        if (plansRes.data.length > 0) {
          await selectPlan(plansRes.data[0]._id);
        } else {
          setActivePlan(null);
          setTasks([]);
        }
      }

      const enrollments = courseRes.data || [];
      const courses = enrollments.map(e => e.course || e).filter(Boolean);
      setEnrolledCourses(courses);
    } catch (err) {
      console.error('[StudyPlannerPage] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectPlan = async (planId) => {
    try {
      const res = await learningService.getStudyPlanById(planId);
      if (res.success && res.data) {
        setActivePlan(res.data.plan);
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error('[StudyPlannerPage] Plan details error:', err);
    }
  };

  const handleCreatePlan = async (formData) => {
    setGenerating(true);
    setMessage('');
    try {
      const res = await learningService.createStudyPlan(formData);
      if (res.success) {
        setIsModalOpen(false);
        setMessage('AI Study Plan generated successfully!');
        await fetchInitialData();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to generate study plan.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const res = await learningService.completeTask(taskId);
      if (res.success) {
        const updatedTask = res.data.task || res.data;
        const updatedTasks = tasks.map(t => t._id === taskId ? { ...t, status: 'Completed' } : t);
        setTasks(updatedTasks);
        if (res.data.plan) {
          setActivePlan(res.data.plan);
        } else {
          recalculateLocalProgress(updatedTasks);
        }
      }
    } catch (err) {
      console.error('Complete task error:', err);
    }
  };

  const handleSkipTask = async (taskId) => {
    try {
      const res = await learningService.skipTask(taskId);
      if (res.success) {
        const updatedTasks = tasks.map(t => t._id === taskId ? { ...t, status: 'Skipped' } : t);
        setTasks(updatedTasks);
        if (res.data.plan) {
          setActivePlan(res.data.plan);
        } else {
          recalculateLocalProgress(updatedTasks);
        }
      }
    } catch (err) {
      console.error('Skip task error:', err);
    }
  };

  const handleRescheduleTask = async (task) => {
    const newDateStr = prompt('Enter new target date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!newDateStr) return;
    try {
      const res = await learningService.rescheduleTask(task._id, newDateStr);
      if (res.success) {
        const updatedTasks = tasks.map(t => t._id === task._id ? { ...t, status: 'Rescheduled', date: newDateStr } : t);
        setTasks(updatedTasks);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid date format');
    }
  };

  const recalculateLocalProgress = (updatedTasks) => {
    if (!activePlan) return;
    const active = updatedTasks.filter(t => t.status !== 'Skipped');
    const completed = updatedTasks.filter(t => t.status === 'Completed');
    const pct = active.length > 0 ? Math.round((completed.length / active.length) * 100) : 0;
    setActivePlan(prev => prev ? {
      ...prev,
      totalTasksCount: updatedTasks.length,
      completedTasksCount: completed.length,
      progressPercentage: pct
    } : null);
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this study plan?')) return;
    try {
      const res = await learningService.deleteStudyPlan(planId);
      if (res.success) {
        const remainingPlans = studyPlans.filter(p => p._id !== planId);
        setStudyPlans(remainingPlans);
        if (activePlan?._id === planId) {
          if (remainingPlans.length > 0) {
            await selectPlan(remainingPlans[0]._id);
          } else {
            setActivePlan(null);
            setTasks([]);
          }
        }
      }
    } catch (err) {
      console.error('Delete plan error:', err);
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    if (selectedCalendarDate) {
      const tDate = new Date(t.date).toDateString();
      const sDate = new Date(selectedCalendarDate).toDateString();
      if (tDate !== sDate) return false;
    }
    if (filterTab === 'Pending') return t.status === 'Pending' || t.status === 'In-Progress' || t.status === 'Rescheduled';
    if (filterTab === 'Completed') return t.status === 'Completed';
    return true;
  });

  // Calculate Countdown
  const getExamCountdown = () => {
    if (!activePlan?.examDate) return null;
    const diff = new Date(activePlan.examDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // Calculated Progress stats
  const totalTasks = tasks.filter(t => t.status !== 'Skipped').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const progressPct = activePlan?.progressPercentage ?? (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200/80 p-6 rounded-3xl shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
              <CalendarRange size={13} />
              Personalized Study Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              AI Study Planner
            </h1>
            <p className="text-sm text-gray-500">
              Organize daily study tasks, set exam deadlines, and stay on track with smart task rescheduling.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center gap-2 transition-all shrink-0"
          >
            <Plus size={16} />
            Create Study Plan
          </button>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={16} />
            {message}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-400 font-medium">Loading study planner...</div>
        ) : studyPlans.length === 0 ? (
          <div className="bg-white border border-gray-200/80 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Study Plans Found</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Generate a personalized study plan for your enrolled course to get AI-powered daily study tasks.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
            >
              <Plus size={14} />
              Generate First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Tasks List & Filters */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Plan Card with Progress */}
              {activePlan && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-sm space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between gap-4">
                    <select
                      value={activePlan._id}
                      onChange={(e) => selectPlan(e.target.value)}
                      className="bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none max-w-xs truncate"
                    >
                      {studyPlans.map((p) => (
                        <option key={p._id} value={p._id} className="text-gray-900">
                          {p.title || (p.courseId?.title ? `${p.courseId.title} Plan` : 'Study Plan')}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDeletePlan(activePlan._id)}
                      className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {activePlan.learningGoal && (
                    <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium text-white/90">
                      <Target size={12} />
                      Goal: {activePlan.learningGoal}
                    </div>
                  )}

                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">Exam Countdown</span>
                      <h2 className="text-3xl font-extrabold tracking-tight mt-1">
                        {getExamCountdown()} Days Remaining
                      </h2>
                    </div>
                    <div className="text-right text-xs text-blue-100 space-y-0.5">
                      <p>{activePlan.availableHoursPerDay} hrs / day</p>
                      <p className="font-semibold">{activePlan.preferredStudyTime} Sessions</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Course Prep Progress</span>
                      <span>{completedTasks} / {totalTasks} Tasks ({progressPct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks Header & Filter Tabs */}
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">Daily Learning Tasks</h3>
                    {selectedCalendarDate && (
                      <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                        {new Date(selectedCalendarDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                    {['All', 'Pending', 'Completed'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setFilterTab(tab)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          filterTab === tab ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                    {selectedCalendarDate && (
                      <button
                        onClick={() => setSelectedCalendarDate(null)}
                        className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        Clear Date Filter
                      </button>
                    )}
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <StudyTask
                        key={task._id}
                        task={task}
                        onComplete={handleCompleteTask}
                        onSkip={handleSkipTask}
                        onReschedule={handleRescheduleTask}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-gray-400">
                      No tasks found for the selected filter.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Calendar Widget */}
            <div className="space-y-6">
              <StudyCalendar
                tasks={tasks}
                selectedDate={selectedCalendarDate}
                onSelectDate={(date) => setSelectedCalendarDate(date)}
              />

              {/* Study Tip Box */}
              <div className="bg-blue-50/60 border border-blue-100 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={14} />
                  AI Adaptive Insight
                </span>
                <p className="text-xs text-blue-900 leading-relaxed">
                  Completing your high-priority daily tasks early increases long-term retention by up to 40%.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Create Plan Modal */}
        <StudyPlanFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreatePlan}
          courses={enrolledCourses}
          loading={generating}
        />
      </main>
    </div>
  );
};

export default StudyPlannerPage;
