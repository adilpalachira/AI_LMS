import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from './RiskBadge';
import { 
  User, 
  BookOpen, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  Send,
  BrainCircuit
} from 'lucide-react';

const StudentRiskCard = ({ performance, onSelectStudent }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  if (!performance) return null;

  const { student, course, metrics, prediction } = performance;
  const isHighRisk = prediction.riskLevel === 'High';

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${
      isHighRisk ? 'border-red-200/90 bg-gradient-to-r from-red-50/20 to-white' : 'border-gray-200/80'
    }`}>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-slate-800 font-bold text-base overflow-hidden shrink-0">
            {student.profileImage ? (
              <img 
                src={`http://localhost:5000/${student.profileImage}`} 
                alt={student.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              student.name?.charAt(0).toUpperCase() || 'S'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-gray-900 leading-tight">{student.name}</h3>
              <RiskBadge riskLevel={prediction.riskLevel} size="sm" />
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{student.email}</p>
          </div>
        </div>

        {/* Course Info Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200/60 rounded-xl text-xs font-semibold text-gray-700 shrink-0">
          <BookOpen size={14} className="text-gray-400" />
          <span>{course.code || 'Course'}: {course.title}</span>
        </div>
      </div>

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-center">
        <div className="p-2.5 bg-gray-50/70 border border-gray-100 rounded-xl">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Est. Final Score</p>
          <p className={`text-lg font-extrabold mt-0.5 ${
            prediction.predictedScore < 50 ? 'text-red-600' : prediction.predictedScore < 70 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {prediction.predictedScore}%
          </p>
        </div>

        <div className="p-2.5 bg-gray-50/70 border border-gray-100 rounded-xl">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Quiz Avg</p>
          <p className="text-lg font-extrabold text-gray-900 mt-0.5">{metrics.quizAvgScore}%</p>
        </div>

        <div className="p-2.5 bg-gray-50/70 border border-gray-100 rounded-xl">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Assignments</p>
          <p className="text-lg font-extrabold text-gray-900 mt-0.5">{metrics.assignmentAvgScore}%</p>
        </div>

        <div className="p-2.5 bg-gray-50/70 border border-gray-100 rounded-xl">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Progress</p>
          <p className="text-lg font-extrabold text-gray-900 mt-0.5">{metrics.courseProgress}%</p>
        </div>
      </div>

      {/* Primary Risk Factors Preview */}
      {prediction.riskFactors && prediction.riskFactors.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
            <AlertCircle size={14} className="text-amber-600 shrink-0" />
            <span>Key Risk Indicators ({prediction.riskFactors.length})</span>
          </div>
          <ul className="space-y-1 text-xs text-amber-800 font-medium pl-5 list-disc">
            {prediction.riskFactors.slice(0, expanded ? undefined : 2).map((factor, idx) => (
              <li key={idx}>{factor}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Expandable Section for Interventions */}
      {expanded && prediction.interventions && prediction.interventions.length > 0 && (
        <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-3 mb-4 space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
            <BrainCircuit size={14} className="text-blue-600 shrink-0" />
            <span>Recommended Actions</span>
          </div>
          <ul className="space-y-1 text-xs text-blue-800 font-medium pl-5 list-disc">
            {prediction.interventions.map((action, idx) => (
              <li key={idx}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Card Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          {expanded ? (
            <>Less details <ChevronUp size={14} /></>
          ) : (
            <>More analysis ({prediction.interventions?.length || 0} actions) <ChevronDown size={14} /></>
          )}
        </button>

        <div className="flex items-center gap-2">
          {onSelectStudent && (
            <button
              onClick={() => onSelectStudent(performance)}
              className="px-3 py-1.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Inspect Profile</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRiskCard;
