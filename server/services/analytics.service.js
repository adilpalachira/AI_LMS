const Enrollment = require('../models/enrollment.model');
const QuizAttempt = require('../models/quizAttempt.model');
const Submission = require('../models/submission.model');
const Assignment = require('../models/assignment.model');
const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const LearningProfile = require('../models/learningProfile.model');
const StudyPlanTask = require('../models/studyPlanTask.model');
const ChatSession = require('../models/chatSession.model');
const User = require('../models/user.model');
const Course = require('../models/course.model');
const Category = require('../models/category.model');

/**
 * Helper to get date threshold for timeframe filtering
 * @param {string} timeframe '7d' | '30d' | '90d' | 'all'
 */
const getTimeframeStartDate = (timeframe = '30d') => {
  if (timeframe === 'all') return null;
  const now = new Date();
  const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
  const days = daysMap[timeframe] || 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
};

/**
 * Module 9 Core Function: Calculate ML features, predicted score, and risk status for a student in a course
 */
const calculateStudentPerformance = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId }).populate('course student', 'name email lastLogin profileImage');
  if (!enrollment) return null;

  const quizAttempts = await QuizAttempt.find({ studentId, courseId });
  const totalQuizzesInCourse = await Quiz.countDocuments({ courseId, status: 'Published' });

  let quizAvgScore = 0;
  let quizPassRate = 0;
  let totalQuizAttemptsCount = quizAttempts.length;

  if (totalQuizAttemptsCount > 0) {
    const totalPercentageSum = quizAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    quizAvgScore = Math.round(totalPercentageSum / totalQuizAttemptsCount);

    const passedCount = quizAttempts.filter(a => a.passed).length;
    quizPassRate = Math.round((passedCount / totalQuizAttemptsCount) * 100);
  }

  const submissions = await Submission.find({ studentId, courseId }).populate('assignmentId');
  const totalAssignmentsInCourse = await Assignment.countDocuments({ courseId, status: 'Published' });

  let assignmentAvgScore = 0;
  let assignmentSubmissionRate = 0;
  let lateSubmissionCount = 0;
  let lateSubmissionRatio = 0;
  let gradedSubmissionsCount = 0;

  if (totalAssignmentsInCourse > 0) {
    assignmentSubmissionRate = Math.round((submissions.length / totalAssignmentsInCourse) * 100);
  } else if (submissions.length > 0) {
    assignmentSubmissionRate = 100;
  }

  if (submissions.length > 0) {
    let earnedSum = 0;
    let maxSum = 0;

    submissions.forEach(sub => {
      if (sub.isLate) lateSubmissionCount++;
      if (sub.status === 'Graded' && sub.assignmentId) {
        earnedSum += (sub.marks || 0);
        maxSum += (sub.assignmentId.maxMarks || 100);
        gradedSubmissionsCount++;
      }
    });

    if (maxSum > 0) {
      assignmentAvgScore = Math.round((earnedSum / maxSum) * 100);
    }
    lateSubmissionRatio = Math.round((lateSubmissionCount / submissions.length) * 100);
  }

  const courseProgress = enrollment.progress || 0;

  const learningProfile = await LearningProfile.findOne({ studentId });
  let weakTopicsCount = 0;
  let courseWeakTopics = [];
  if (learningProfile && learningProfile.weakTopics) {
    courseWeakTopics = learningProfile.weakTopics.filter(w => w.courseId && w.courseId.toString() === courseId.toString());
    weakTopicsCount = courseWeakTopics.length;
  }

  const studyTasks = await StudyPlanTask.find({ studentId, courseId });
  let studyTaskCompletionRate = 0;
  if (studyTasks.length > 0) {
    const completedTasks = studyTasks.filter(t => t.completed).length;
    studyTaskCompletionRate = Math.round((completedTasks / studyTasks.length) * 100);
  }

  let daysInactive = 0;
  if (enrollment.student && enrollment.student.lastLogin) {
    const diffMs = Date.now() - new Date(enrollment.student.lastLogin).getTime();
    daysInactive = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  const aiSessionsCount = await ChatSession.countDocuments({ studentId, courseId });

  const hasEvaluatedData = (totalQuizAttemptsCount > 0 || gradedSubmissionsCount > 0 || courseProgress > 10);

  let predictedScore = 0;
  let riskLevel = 'Low';
  const riskFactors = [];
  const interventions = [];

  if (!hasEvaluatedData) {
    predictedScore = 50;
    riskLevel = 'Unevaluated';
    riskFactors.push('No quizzes or assignments completed yet for evaluation');
    interventions.push('Prompt student to complete initial diagnostic assessment and study course materials');
  } else {
    const quizComponent = totalQuizAttemptsCount > 0 ? quizAvgScore : courseProgress;
    const assignmentComponent = gradedSubmissionsCount > 0 ? assignmentAvgScore : courseProgress;
    
    let rawScore = (quizComponent * 0.40) + (assignmentComponent * 0.40) + (courseProgress * 0.20);

    if (lateSubmissionRatio > 25) {
      rawScore -= 5;
      riskFactors.push(`High late submission rate (${lateSubmissionRatio}%)`);
    }
    if (weakTopicsCount > 0) {
      rawScore -= (weakTopicsCount * 3);
      riskFactors.push(`${weakTopicsCount} identified weak topic(s) needing remediation`);
    }
    if (daysInactive > 7) {
      rawScore -= Math.min(15, daysInactive);
      riskFactors.push(`Inactive on platform for ${daysInactive} days`);
    }
    if (quizPassRate > 0 && quizPassRate < 50) {
      riskFactors.push(`Low quiz pass rate (${quizPassRate}%)`);
    }
    if (assignmentSubmissionRate < 50 && totalAssignmentsInCourse > 0) {
      riskFactors.push(`Low assignment submission rate (${assignmentSubmissionRate}%)`);
    }

    predictedScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    if (predictedScore < 50 || quizAvgScore < 40 || assignmentSubmissionRate < 40 || daysInactive >= 10) {
      riskLevel = 'High';
    } else if (predictedScore < 70 || lateSubmissionRatio > 30 || weakTopicsCount >= 2 || daysInactive >= 5) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'Low';
    }

    if (riskLevel === 'High') {
      interventions.push('Schedule 1-on-1 tutoring or faculty advisement session');
      interventions.push('Assign structured remedial AI study plan focusing on weak concepts');
      interventions.push('Send deadline reminder and check-in notification');
    } else if (riskLevel === 'Medium') {
      interventions.push('Recommend review of weak topic lessons and interactive practice quizzes');
      interventions.push('Remind student of upcoming assignment deadlines to reduce late submissions');
    } else {
      interventions.push('Student is performing well; encourage continued progress');
    }
  }

  return {
    student: {
      id: enrollment.student?._id || studentId,
      name: enrollment.student?.name || 'Student',
      email: enrollment.student?.email || '',
      profileImage: enrollment.student?.profileImage || '',
      lastLogin: enrollment.student?.lastLogin
    },
    course: {
      id: enrollment.course?._id || courseId,
      title: enrollment.course?.title || '',
      code: enrollment.course?.code || ''
    },
    metrics: {
      quizAvgScore,
      quizPassRate,
      totalQuizAttemptsCount,
      assignmentAvgScore,
      assignmentSubmissionRate,
      gradedSubmissionsCount,
      lateSubmissionCount,
      lateSubmissionRatio,
      courseProgress,
      weakTopicsCount,
      studyTaskCompletionRate,
      daysInactive,
      aiSessionsCount
    },
    mlFeatures: {
      quizAvgScore,
      quizPassRate,
      assignmentAvgScore,
      assignmentSubmissionRate,
      lateSubmissionRatio,
      courseProgress,
      weakTopicsCount,
      studyTaskCompletionRate,
      daysInactive
    },
    prediction: {
      predictedScore,
      riskLevel,
      hasEvaluatedData,
      riskFactors,
      interventions,
      calculatedAt: new Date()
    }
  };
};

/**
 * Module 9 Core Function: Get aggregated performance and risk analytics for a specific course
 */
const getCourseAnalyticsSummary = async (courseId) => {
  const course = await Course.findById(courseId).populate('instructor', 'name email');
  if (!course) throw new Error('Course not found');

  const enrollments = await Enrollment.find({ course: courseId, status: 'Active' });
  const studentPerformances = [];

  for (const en of enrollments) {
    const perf = await calculateStudentPerformance(en.student, courseId);
    if (perf) studentPerformances.push(perf);
  }

  const totalStudents = studentPerformances.length;
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;
  let unevaluatedCount = 0;

  let sumPredictedScores = 0;
  let sumQuizAvg = 0;
  let sumAssignmentAvg = 0;
  let sumProgress = 0;

  studentPerformances.forEach(sp => {
    sumPredictedScores += sp.prediction.predictedScore;
    sumQuizAvg += sp.metrics.quizAvgScore;
    sumAssignmentAvg += sp.metrics.assignmentAvgScore;
    sumProgress += sp.metrics.courseProgress;

    if (sp.prediction.riskLevel === 'High') highRiskCount++;
    else if (sp.prediction.riskLevel === 'Medium') mediumRiskCount++;
    else if (sp.prediction.riskLevel === 'Low') lowRiskCount++;
    else unevaluatedCount++;
  });

  const avgPredictedScore = totalStudents > 0 ? Math.round(sumPredictedScores / totalStudents) : 0;
  const avgQuizScore = totalStudents > 0 ? Math.round(sumQuizAvg / totalStudents) : 0;
  const avgAssignmentScore = totalStudents > 0 ? Math.round(sumAssignmentAvg / totalStudents) : 0;
  const avgCourseProgress = totalStudents > 0 ? Math.round(sumProgress / totalStudents) : 0;

  const gradeDistribution = {
    excellent: studentPerformances.filter(s => s.prediction.predictedScore >= 85).length,
    good: studentPerformances.filter(s => s.prediction.predictedScore >= 70 && s.prediction.predictedScore < 85).length,
    average: studentPerformances.filter(s => s.prediction.predictedScore >= 50 && s.prediction.predictedScore < 70).length,
    atRisk: studentPerformances.filter(s => s.prediction.predictedScore < 50).length
  };

  return {
    course: {
      id: course._id,
      title: course.title,
      code: course.code,
      instructor: course.instructor?.name || 'Faculty'
    },
    overview: {
      totalStudents,
      avgPredictedScore,
      avgQuizScore,
      avgAssignmentScore,
      avgCourseProgress,
      riskBreakdown: {
        high: highRiskCount,
        medium: mediumRiskCount,
        low: lowRiskCount,
        unevaluated: unevaluatedCount
      },
      gradeDistribution
    },
    students: studentPerformances,
    atRiskStudents: studentPerformances.filter(s => s.prediction.riskLevel === 'High' || s.prediction.riskLevel === 'Medium')
  };
};

/**
 * Module 9 Core Function: Get all at-risk students across courses
 */
const getAtRiskStudentsList = async (filters = {}, currentUser) => {
  let courseQuery = {};
  if (currentUser.role === 'Faculty') {
    courseQuery = { $or: [{ instructor: currentUser._id }, { createdBy: currentUser._id }] };
  }
  if (filters.courseId) courseQuery._id = filters.courseId;

  const courses = await Course.find(courseQuery);
  const courseIds = courses.map(c => c._id);
  const enrollments = await Enrollment.find({ course: { $in: courseIds }, status: 'Active' });

  const allPerformances = [];
  for (const en of enrollments) {
    const perf = await calculateStudentPerformance(en.student, en.course);
    if (perf) {
      if (!filters.riskLevel || filters.riskLevel === 'All' || perf.prediction.riskLevel === filters.riskLevel) {
        allPerformances.push(perf);
      }
    }
  }

  const sorted = allPerformances.sort((a, b) => {
    const riskOrder = { High: 1, Medium: 2, Low: 3, Unevaluated: 4 };
    if (riskOrder[a.prediction.riskLevel] !== riskOrder[b.prediction.riskLevel]) {
      return riskOrder[a.prediction.riskLevel] - riskOrder[b.prediction.riskLevel];
    }
    return a.prediction.predictedScore - b.prediction.predictedScore;
  });

  return {
    totalCount: sorted.length,
    highRiskCount: sorted.filter(s => s.prediction.riskLevel === 'High').length,
    mediumRiskCount: sorted.filter(s => s.prediction.riskLevel === 'Medium').length,
    students: sorted
  };
};

// =========================================================================
// MODULE 10: INTELLIGENT LEARNING ANALYTICS & DASHBOARD SERVICES
// =========================================================================

/**
 * MODULE 10: Detailed Student Analytics (Student View)
 * Calculates real historical trends, assessment breakdown, and engagement metrics
 * @param {string} studentId 
 * @param {string} timeframe '7d' | '30d' | '90d' | 'all'
 */
const getStudentDetailedAnalytics = async (studentId, timeframe = '30d') => {
  const startDate = getTimeframeStartDate(timeframe);
  const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

  // 1. Course Enrollments & Completion
  const enrollments = await Enrollment.find({ student: studentId }).populate('course', 'title code thumbnail category');
  const activeEnrollments = enrollments.filter(e => e.status === 'Active');
  const completedEnrollments = enrollments.filter(e => e.status === 'Completed');

  let avgCourseProgress = 0;
  if (enrollments.length > 0) {
    const sumProg = enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    avgCourseProgress = Math.round(sumProg / enrollments.length);
  }

  const courseIds = enrollments.map(e => e.course?._id).filter(Boolean);

  // 2. Quiz Attempts Analysis & Trend
  const quizFilter = { studentId, ...dateFilter };
  const quizAttempts = await QuizAttempt.find(quizFilter).sort({ createdAt: 1 }).populate('quizId', 'title passingMarks');

  let quizAvgScore = 0;
  let quizPassRate = 0;
  if (quizAttempts.length > 0) {
    const sumPercentage = quizAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    quizAvgScore = Math.round(sumPercentage / quizAttempts.length);
    const passedCount = quizAttempts.filter(a => a.passed).length;
    quizPassRate = Math.round((passedCount / quizAttempts.length) * 100);
  }

  // Quiz Performance Trend Timeline
  const quizTrend = quizAttempts.map(attempt => ({
    date: attempt.createdAt ? new Date(attempt.createdAt).toISOString().split('T')[0] : 'N/A',
    quizTitle: attempt.quizId?.title || 'Quiz Attempt',
    percentage: attempt.percentage || 0,
    passed: attempt.passed || false
  }));

  // 3. Submissions & Assignment Performance
  const subFilter = { studentId, ...dateFilter };
  const submissions = await Submission.find(subFilter).populate('assignmentId', 'title maxMarks deadline');

  let assignmentAvgScore = 0;
  let lateSubmissionsCount = 0;
  let gradedSubmissionsCount = 0;

  if (submissions.length > 0) {
    let totalEarned = 0;
    let totalPossible = 0;

    submissions.forEach(sub => {
      if (sub.isLate) lateSubmissionsCount++;
      if (sub.status === 'Graded' && sub.assignmentId) {
        totalEarned += (sub.marks || 0);
        totalPossible += (sub.assignmentId.maxMarks || 100);
        gradedSubmissionsCount++;
      }
    });

    if (totalPossible > 0) {
      assignmentAvgScore = Math.round((totalEarned / totalPossible) * 100);
    }
  }

  // 4. Learning Activity & AI Tutor Metrics
  const aiSessionsCount = await ChatSession.countDocuments({ studentId, ...dateFilter });
  const studyTasks = await StudyPlanTask.find({ studentId, ...dateFilter });
  const completedStudyTasks = studyTasks.filter(t => t.completed || t.status === 'Completed').length;
  const studyTaskCompletionRate = studyTasks.length > 0 ? Math.round((completedStudyTasks / studyTasks.length) * 100) : 0;

  // 5. Consumed Module 9 Predictions across courses
  const coursePredictions = [];
  for (const en of activeEnrollments) {
    if (en.course) {
      const pred = await calculateStudentPerformance(studentId, en.course._id);
      if (pred) coursePredictions.push(pred);
    }
  }

  // 6. Objective Natural Language Insights (Derived strictly from calculated stats)
  const insights = [];
  if (enrollments.length === 0) {
    insights.push('You are not currently enrolled in any active courses.');
  } else {
    if (avgCourseProgress >= 75) {
      insights.push(`Strong course progress recorded at ${avgCourseProgress}% across enrolled subjects.`);
    } else {
      insights.push(`Overall course progress is at ${avgCourseProgress}%. Consistent study sessions recommended.`);
    }

    if (quizAttempts.length > 0) {
      insights.push(`Quiz average score is ${quizAvgScore}% with a ${quizPassRate}% pass rate across ${quizAttempts.length} attempts.`);
    } else {
      insights.push('No quiz attempts completed in the selected timeframe.');
    }

    if (lateSubmissionsCount > 0) {
      insights.push(`${lateSubmissionsCount} assignment submission(s) were submitted after the deadline.`);
    }

    if (aiSessionsCount > 0) {
      insights.push(`Engaged in ${aiSessionsCount} AI Tutor learning session(s) in this timeframe.`);
    }
  }

  return {
    timeframe,
    summaryCards: {
      enrolledCoursesCount: activeEnrollments.length,
      completedCoursesCount: completedEnrollments.length,
      avgCourseProgress,
      quizAvgScore,
      quizPassRate,
      totalQuizAttempts: quizAttempts.length,
      assignmentAvgScore,
      totalSubmissions: submissions.length,
      lateSubmissionsCount,
      aiSessionsCount,
      totalStudyTasks: studyTasks.length,
      completedStudyTasks,
      studyTaskCompletionRate
    },
    quizTrend,
    coursePredictions,
    insights,
    recentSubmissions: submissions.slice(0, 5).map(s => ({
      id: s._id,
      assignmentTitle: s.assignmentId?.title || 'Assignment',
      submittedAt: s.submittedAt,
      marks: s.marks,
      status: s.status,
      isLate: s.isLate
    }))
  };
};

/**
 * MODULE 10: Detailed Course Analytics & Item Difficulty (Faculty View)
 * @param {string} courseId 
 * @param {string} timeframe 
 */
const getCourseDetailedAnalytics = async (courseId, timeframe = '30d') => {
  const course = await Course.findById(courseId).populate('instructor', 'name email');
  if (!course) throw new Error('Course not found');

  const startDate = getTimeframeStartDate(timeframe);
  const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

  // 1. Enrollment & Learner Activity Status
  const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'name email lastLogin profileImage');
  const totalStudents = enrollments.length;
  const completedStudentsCount = enrollments.filter(e => e.status === 'Completed').length;
  const completionRate = totalStudents > 0 ? Math.round((completedStudentsCount / totalStudents) * 100) : 0;

  // Active learners rule: Student logged in or was active within last 14 days
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  let activeLearnersCount = 0;
  let inactiveLearnersCount = 0;

  enrollments.forEach(e => {
    if (e.student && e.student.lastLogin && new Date(e.student.lastLogin) >= fourteenDaysAgo) {
      activeLearnersCount++;
    } else {
      inactiveLearnersCount++;
    }
  });

  // 2. Assessment Metrics: Quizzes & Submissions
  const quizFilter = { courseId, ...dateFilter };
  const quizAttempts = await QuizAttempt.find(quizFilter).populate('quizId', 'title');

  let avgQuizScore = 0;
  let highestQuizScore = 0;
  let lowestQuizScore = 100;
  let totalQuizAttemptsCount = quizAttempts.length;

  if (totalQuizAttemptsCount > 0) {
    let sumPercentage = 0;
    quizAttempts.forEach(a => {
      const p = a.percentage || 0;
      sumPercentage += p;
      if (p > highestQuizScore) highestQuizScore = p;
      if (p < lowestQuizScore) lowestQuizScore = p;
    });
    avgQuizScore = Math.round(sumPercentage / totalQuizAttemptsCount);
  } else {
    lowestQuizScore = 0;
  }

  // 3. Question Item Analysis (Identify Question Difficulty based on real student answers)
  const questionPerformanceMap = {}; // { questionId: { text, incorrectCount, totalAttempts, errorRate } }
  
  quizAttempts.forEach(attempt => {
    if (attempt.answers && attempt.answers.length > 0) {
      attempt.answers.forEach(ans => {
        const qId = ans.questionId?.toString() || 'unknown';
        if (!questionPerformanceMap[qId]) {
          questionPerformanceMap[qId] = {
            questionId: qId,
            totalAttempts: 0,
            incorrectCount: 0
          };
        }
        questionPerformanceMap[qId].totalAttempts += 1;
        if (!ans.isCorrect) {
          questionPerformanceMap[qId].incorrectCount += 1;
        }
      });
    }
  });

  // Populate Question texts and compute difficulty tiers
  const questionItemAnalysis = [];
  for (const qId of Object.keys(questionPerformanceMap)) {
    const item = questionPerformanceMap[qId];
    if (qId !== 'unknown' && item.totalAttempts > 0) {
      const dbQ = await Question.findById(qId).select('question explanation type difficulty');
      if (dbQ) {
        const errorRate = Math.round((item.incorrectCount / item.totalAttempts) * 100);
        let difficultyTag = 'Well-Mastered'; // <30% error rate
        if (errorRate >= 50) difficultyTag = 'Frequently Incorrect'; // >=50% error rate
        else if (errorRate >= 30) difficultyTag = 'Challenging'; // 30-49% error rate

        questionItemAnalysis.push({
          questionId: dbQ._id,
          questionText: dbQ.question,
          totalAttempts: item.totalAttempts,
          incorrectCount: item.incorrectCount,
          errorRate,
          difficultyTag
        });
      }
    }
  }

  // Sort questions by error rate descending (most difficult first)
  questionItemAnalysis.sort((a, b) => b.errorRate - a.errorRate);

  // 4. Assignments Summary
  const subFilter = { courseId, ...dateFilter };
  const submissions = await Submission.find(subFilter).populate('assignmentId', 'title maxMarks');
  const totalAssignments = await Assignment.countDocuments({ courseId, status: 'Published' });

  let avgAssignmentScore = 0;
  let lateSubmissionsCount = 0;
  let submissionRate = 0;

  if (submissions.length > 0) {
    let earnedSum = 0;
    let maxPossibleSum = 0;

    submissions.forEach(sub => {
      if (sub.isLate) lateSubmissionsCount++;
      if (sub.status === 'Graded' && sub.assignmentId) {
        earnedSum += (sub.marks || 0);
        maxPossibleSum += (sub.assignmentId.maxMarks || 100);
      }
    });

    if (maxPossibleSum > 0) {
      avgAssignmentScore = Math.round((earnedSum / maxPossibleSum) * 100);
    }
  }

  if (totalStudents > 0 && totalAssignments > 0) {
    submissionRate = Math.round((submissions.length / (totalStudents * totalAssignments)) * 100);
  }

  // 5. Consumed Module 9 Risk Distribution
  const courseSummary = await getCourseAnalyticsSummary(courseId);

  // 6. Objective Natural Language Insights
  const insights = [];
  if (totalStudents === 0) {
    insights.push('No students are currently enrolled in this course.');
  } else {
    insights.push(`Enrolled cohort: ${totalStudents} students (${activeLearnersCount} active in the last 14 days, ${completionRate}% completed).`);
    insights.push(`Quiz performance average is ${avgQuizScore}% across ${totalQuizAttemptsCount} total attempt(s).`);

    const freqIncorrect = questionItemAnalysis.filter(q => q.difficultyTag === 'Frequently Incorrect');
    if (freqIncorrect.length > 0) {
      insights.push(`${freqIncorrect.length} question(s) identified with high error rates (≥50% incorrect answers).`);
    } else {
      insights.push('No questions show critical error rates exceeding 50%.');
    }

    if (lateSubmissionsCount > 0) {
      insights.push(`${lateSubmissionsCount} assignment submission(s) were flagged as late.`);
    }
  }

  return {
    timeframe,
    course: {
      id: course._id,
      title: course.title,
      code: course.code,
      instructor: course.instructor?.name || 'Faculty'
    },
    overview: {
      totalStudents,
      activeLearnersCount,
      inactiveLearnersCount,
      completedStudentsCount,
      completionRate,
      avgQuizScore,
      highestQuizScore,
      lowestQuizScore,
      totalQuizAttemptsCount,
      avgAssignmentScore,
      submissionRate,
      lateSubmissionsCount,
      riskBreakdown: courseSummary.overview.riskBreakdown
    },
    questionItemAnalysis: questionItemAnalysis.slice(0, 10), // Top 10 difficult items
    insights,
    students: courseSummary.students || [],
    atRiskStudents: courseSummary.atRiskStudents
  };
};

/**
 * MODULE 10: Academic System Overview Analytics (Admin View)
 * Aggregates platform-wide completion, engagement, assessment, and course performance comparisons
 * @param {string} timeframe 
 */
const getAdminSystemAnalytics = async (timeframe = '30d') => {
  const startDate = getTimeframeStartDate(timeframe);
  const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

  // 1. System Totals
  const totalUsers = await User.countDocuments();
  const studentCount = await User.countDocuments({ role: 'Student' });
  const facultyCount = await User.countDocuments({ role: 'Faculty' });
  const adminCount = await User.countDocuments({ role: 'Admin' });

  const totalCourses = await Course.countDocuments();
  const publishedCoursesCount = await Course.countDocuments({ status: 'Published' });
  const totalCategories = await Category.countDocuments();
  const totalEnrollments = await Enrollment.countDocuments();

  const completedEnrollmentsCount = await Enrollment.countDocuments({ status: 'Completed' });
  const systemCompletionRate = totalEnrollments > 0 ? Math.round((completedEnrollmentsCount / totalEnrollments) * 100) : 0;

  // Active Users (logged in within 14 days)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const activeStudentsCount = await User.countDocuments({ role: 'Student', lastLogin: { $gte: fourteenDaysAgo } });
  const inactiveStudentsCount = Math.max(0, studentCount - activeStudentsCount);

  // 2. Assessment Totals
  const totalQuizzes = await Quiz.countDocuments({ status: 'Published' });
  const totalQuizAttempts = await QuizAttempt.countDocuments(dateFilter);
  const totalAssignments = await Assignment.countDocuments({ status: 'Published' });
  const totalSubmissions = await Submission.countDocuments(dateFilter);

  // 3. Course Performance Comparison Breakdown Table
  const courses = await Course.find({ status: 'Published' }).populate('instructor', 'name');
  const courseComparisons = [];

  let systemHighRiskCount = 0;
  let systemMediumRiskCount = 0;
  let systemLowRiskCount = 0;
  let systemUnevaluatedCount = 0;

  for (const c of courses) {
    const summary = await getCourseAnalyticsSummary(c._id);
    systemHighRiskCount += summary.overview.riskBreakdown.high;
    systemMediumRiskCount += summary.overview.riskBreakdown.medium;
    systemLowRiskCount += summary.overview.riskBreakdown.low;
    systemUnevaluatedCount += summary.overview.riskBreakdown.unevaluated;

    courseComparisons.push({
      courseId: c._id,
      code: c.code,
      title: c.title,
      instructor: c.instructor?.name || 'Faculty',
      enrolledStudents: summary.overview.totalStudents,
      avgPredictedScore: summary.overview.avgPredictedScore,
      avgQuizScore: summary.overview.avgQuizScore,
      avgAssignmentScore: summary.overview.avgAssignmentScore,
      avgCourseProgress: summary.overview.avgCourseProgress,
      atRiskCount: summary.overview.riskBreakdown.high + summary.overview.riskBreakdown.medium
    });
  }

  // Sort course comparison table by highest enrolled students first
  courseComparisons.sort((a, b) => b.enrolledStudents - a.enrolledStudents);

  // 5. Question Content Monitoring Metrics for Admin
  const totalQuestions = await Question.countDocuments();
  const questionsAiCount = await Question.countDocuments({ isAiGenerated: true });
  const questionsManualCount = Math.max(0, totalQuestions - questionsAiCount);

  const easyQuestionsCount = await Question.countDocuments({ difficulty: 'Easy' });
  const mediumQuestionsCount = await Question.countDocuments({ difficulty: 'Medium' });
  const hardQuestionsCount = await Question.countDocuments({ difficulty: 'Hard' });

  const mcqCount = await Question.countDocuments({ type: { $in: ['Multiple Choice', 'MCQ'] } });
  const tfCount = await Question.countDocuments({ type: 'True/False' });
  const shortAnswerCount = await Question.countDocuments({ type: { $in: ['Short Answer', 'Essay', 'Descriptive'] } });

  const questionsByCourse = await Question.aggregate([
    { $match: { courseId: { $ne: null } } },
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
    { $unwind: '$course' },
    { $project: { courseTitle: '$course.title', courseCode: '$course.code', count: 1 } },
    { $sort: { count: -1 } },
    { $limit: 8 }
  ]);

  const questionsByFaculty = await Question.aggregate([
    { $match: { createdBy: { $ne: null } } },
    { $group: { _id: '$createdBy', count: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { facultyName: '$user.name', count: 1 } },
    { $sort: { count: -1 } },
    { $limit: 8 }
  ]);

  const questionOverview = {
    totalQuestions,
    questionsAiCount,
    questionsManualCount,
    difficultyDistribution: {
      easy: easyQuestionsCount,
      medium: mediumQuestionsCount,
      hard: hardQuestionsCount
    },
    typeDistribution: {
      mcq: mcqCount,
      trueFalse: tfCount,
      shortAnswer: shortAnswerCount
    },
    questionsByCourse,
    questionsByFaculty
  };

  const insights = [
    `Platform hosts ${totalUsers} users (${studentCount} students, ${facultyCount} faculty) across ${publishedCoursesCount} published courses.`,
    `System-wide course completion rate stands at ${systemCompletionRate}% with ${activeStudentsCount} active students in the last 14 days.`,
    `Total assessment participation: ${totalQuizAttempts} quiz attempts and ${totalSubmissions} assignment submissions recorded.`,
    `Question repository contains ${totalQuestions} items (${questionsAiCount} AI-generated, ${questionsManualCount} faculty created).`,
    `System-wide risk status: ${systemHighRiskCount} high risk and ${systemMediumRiskCount} medium risk student flags identified.`
  ];

  return {
    timeframe,
    totals: {
      totalUsers,
      studentCount,
      facultyCount,
      adminCount,
      totalCourses,
      publishedCoursesCount,
      totalCategories,
      totalEnrollments,
      completedEnrollmentsCount,
      systemCompletionRate,
      activeStudentsCount,
      inactiveStudentsCount,
      totalQuizzes,
      totalQuizAttempts,
      totalAssignments,
      totalSubmissions,
      totalQuestions
    },
    riskBreakdown: {
      high: systemHighRiskCount,
      medium: systemMediumRiskCount,
      low: systemLowRiskCount,
      unevaluated: systemUnevaluatedCount
    },
    questionOverview,
    courseComparisons,
    insights
  };
};

module.exports = {
  calculateStudentPerformance,
  getCourseAnalyticsSummary,
  getAtRiskStudentsList,
  getStudentDetailedAnalytics,
  getCourseDetailedAnalytics,
  getAdminSystemAnalytics
};
