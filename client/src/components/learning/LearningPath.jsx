import React from 'react';
import { ArrowRight, CheckCircle2, BookOpen, RotateCcw, HelpCircle } from 'lucide-react';

const LearningPath = ({ pathData, onNavigateResource }) => {
  if (!pathData || !pathData.recommendedPath) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-2xl">
        Select a course to view your personalized learning path.
      </div>
    );
  }

  const { course, strongTopics, weakTopics, recommendedPath } = pathData;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Revision':
        return <RotateCcw size={16} className="text-amber-600" />;
      case 'Quiz':
        return <HelpCircle size={16} className="text-purple-600" />;
      default:
        return <BookOpen size={16} className="text-blue-600" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
      {/* Course Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            {course.code}
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-2">{course.title}</h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 font-medium">Course Completion</span>
          <p className="text-lg font-bold text-gray-900">{course.progress}%</p>
        </div>
      </div>

      {/* Topics Summary Pills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weak Topics */}
        <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-xl">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
            Topics to Improve ({weakTopics.length})
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {weakTopics.length > 0 ? (
              weakTopics.map((topic, idx) => (
                <span key={idx} className="bg-white text-rose-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-rose-200">
                  ⚠️ {topic}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">No weak topics detected.</span>
            )}
          </div>
        </div>

        {/* Strong Topics */}
        <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Mastered Concepts ({strongTopics.length})
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {strongTopics.length > 0 ? (
              strongTopics.map((topic, idx) => (
                <span key={idx} className="bg-white text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-emerald-200">
                  ✨ {topic}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">Complete assessments to unlock strong topics.</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Steps Timeline */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">
          Recommended Learning Steps
        </h3>

        <div className="space-y-3">
          {recommendedPath.map((step) => (
            <div
              key={step.step}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 transition-all group"
            >
              <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700 shrink-0 shadow-xs">
                {step.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getTypeIcon(step.type)}
                  <h4 className="text-sm font-bold text-gray-900">{step.title}</h4>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.description}</p>
              </div>
              {step.resourceId && (
                <button
                  onClick={() => onNavigateResource && onNavigateResource(step.resourceId)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 transition-colors"
                >
                  Start
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
