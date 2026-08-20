const mongoose = require('mongoose');
require('dotenv').config();
require('./models/course.model');
require('./models/user.model');
require('./models/enrollment.model');
require('./models/studyPlan.model');
require('./models/studyPlanTask.model');
require('./models/assignment.model');
require('./models/submission.model');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-lms')
  .then(async () => {
    const userId = new mongoose.Types.ObjectId('6a6a2cc80a0bb2de2c01972c');
    console.log('1. Starting DB queries');
    
    console.log('Fetching enrollments...');
    const enrollments = await mongoose.model('Enrollment').find({ student: userId, status: 'Active' })
      .populate('course')
      .sort({ updatedAt: -1 });
    console.log('Enrollments count:', enrollments.length);
    
    const courseIds = enrollments.map(e => e.course?._id).filter(Boolean);
    console.log('Course IDs:', courseIds);
    
    console.log('Fetching study plans...');
    const studyPlans = await mongoose.model('StudyPlan').find({ studentId: userId, status: { $ne: 'Archived' } })
      .populate('courseId')
      .sort({ createdAt: -1 });
    console.log('Study plans count:', studyPlans.length);
    
    const planIds = studyPlans.map(p => p._id);
    
    console.log('Fetching pending tasks...');
    const pendingTasks = await mongoose.model('StudyPlanTask').find({
      studyPlanId: { $in: planIds },
      status: { $in: ['Pending', 'In-Progress', 'Rescheduled'] }
    }).sort({ date: 1, order: 1 });
    console.log('Pending tasks count:', pendingTasks.length);
    
    console.log('Fetching completed tasks...');
    const completedTasks = await mongoose.model('StudyPlanTask').find({
      studyPlanId: { $in: planIds },
      status: 'Completed'
    }).sort({ completedAt: -1 }).limit(10);
    console.log('Completed tasks count:', completedTasks.length);
    
    console.log('Fetching assignments...');
    const assignments = await mongoose.model('Assignment').find({
      courseId: { $in: courseIds },
      status: 'Published'
    }).populate('courseId').sort({ deadline: 1 });
    console.log('Assignments count:', assignments.length);
    
    console.log('Fetching submissions...');
    const submissions = await mongoose.model('Submission').find({ studentId: userId });
    console.log('Submissions count:', submissions.length);
    
    console.log('Queries finished. Simulating formatting...');
    
    const submittedAssignmentIds = submissions.map(s => s.assignmentId ? s.assignmentId.toString() : '');
    const unsubmittedAssignments = assignments.filter(a => !submittedAssignmentIds.includes(a._id.toString()));

    let todayTopic = null;
    if (pendingTasks.length > 0) {
      const topTask = pendingTasks[0];
      const parentPlan = studyPlans.find(p => p._id.toString() === topTask.studyPlanId.toString());
      todayTopic = {
        courseTitle: parentPlan?.courseId?.title || 'Study Course',
        unitTitle: topTask.topic || parentPlan?.courseId?.code || 'Current Module',
        title: topTask.title,
        description: topTask.description || 'Focus on completing today\'s daily task.',
        estimatedMinutes: topTask.durationMinutes || 45,
        progressPercentage: parentPlan?.progressPercentage || 0
      };
    } else if (enrollments.length > 0) {
      const firstCourse = enrollments[0].course;
      todayTopic = {
        courseTitle: firstCourse?.title || 'Enrolled Course',
        unitTitle: firstCourse?.code || 'Unit 1',
        title: firstCourse?.title ? `Learning ${firstCourse.title}` : 'Continue Coursework',
        description: firstCourse?.shortDescription || 'Review active modules and lessons.',
        estimatedMinutes: 45,
        progressPercentage: enrollments[0].progress || 0
      };
    }
    console.log('todayTopic:', todayTopic);

    let nextExam = null;
    const plansWithExam = studyPlans.filter(p => p.examDate && new Date(p.examDate) >= new Date())
      .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

    if (plansWithExam.length > 0) {
      const plan = plansWithExam[0];
      const diffMs = new Date(plan.examDate).getTime() - new Date().getTime();
      const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      nextExam = {
        title: plan.title || `${plan.courseId?.title || 'Course'} Assessment`,
        date: new Date(plan.examDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        daysLeft,
        courseCode: plan.courseId?.code || ''
      };
    } else if (unsubmittedAssignments.length > 0) {
      const nextAss = unsubmittedAssignments[0];
      const diffMs = new Date(nextAss.deadline).getTime() - new Date().getTime();
      const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      nextExam = {
        title: `Assignment: ${nextAss.title}`,
        date: new Date(nextAss.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        daysLeft,
        courseCode: nextAss.courseId?.code || ''
      };
    }
    console.log('nextExam:', nextExam);

    const pendingWorks = [];
    unsubmittedAssignments.slice(0, 3).forEach((ass) => {
      const diffMs = new Date(ass.deadline).getTime() - new Date().getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      pendingWorks.push({
        id: `ass_${ass._id}`,
        type: 'Assignment',
        title: ass.title,
        subject: ass.courseId?.title || 'Course Assignment',
        due: daysLeft <= 1 ? 'Due Soon' : `Due in ${daysLeft} days`,
        priority: daysLeft <= 2 ? 'High' : 'Medium',
        color: daysLeft <= 2 ? 'text-red-600 bg-red-50 border-red-200' : 'text-amber-600 bg-amber-50 border-amber-200'
      });
    });

    pendingTasks.slice(0, 5 - pendingWorks.length).forEach((task) => {
      const parentPlan = studyPlans.find(p => p._id.toString() === task.studyPlanId.toString());
      pendingWorks.push({
        id: `task_${task._id}`,
        type: 'Study Task',
        title: task.title,
        subject: parentPlan?.courseId?.title || 'Personal Study',
        due: new Date(task.date).toLocaleDateString(),
        priority: task.priority || 'Medium',
        color: task.priority === 'High' ? 'text-red-600 bg-red-50 border-red-200' : task.priority === 'Medium' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-green-600 bg-green-50 border-green-200'
      });
    });
    console.log('pendingWorks:', pendingWorks);

    const todayStr = new Date().toDateString();
    const todaysTasks = pendingTasks.filter(t => new Date(t.date).toDateString() === todayStr);
    const scheduleTasks = todaysTasks.length > 0 ? todaysTasks : pendingTasks.slice(0, 4);

    const scheduleColors = ['border-blue-600', 'border-emerald-600', 'border-amber-600', 'border-purple-600'];
    const schedule = scheduleTasks.map((t, idx) => {
      const parentPlan = studyPlans.find(p => p._id.toString() === t.studyPlanId.toString());
      return {
        id: t._id,
        time: `Session ${idx + 1}`,
        duration: `${t.durationMinutes || 45}m`,
        title: t.title,
        detail: parentPlan?.courseId?.title || t.topic || 'Daily Learning Session',
        color: scheduleColors[idx % scheduleColors.length]
      };
    });
    console.log('schedule:', schedule);

    const upcomingExams = plansWithExam.slice(0, 3).map(plan => {
      const diffMs = new Date(plan.examDate).getTime() - new Date().getTime();
      const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return {
        title: plan.title || `${plan.courseId?.title} Exam`,
        date: new Date(plan.examDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: '10:00 AM',
        daysLeft
      };
    });
    console.log('upcomingExams:', upcomingExams);

    const activities = [];
    completedTasks.slice(0, 3).forEach(task => {
      activities.push({
        id: `comp_${task._id}`,
        text: `Completed: ${task.title}`,
        time: task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Recently',
        iconColor: 'text-green-600 bg-green-50 border-green-100'
      });
    });
    submissions.slice(0, 3 - activities.length).forEach(sub => {
      activities.push({
        id: `sub_${sub._id}`,
        text: `Submitted assignment`,
        time: new Date(sub.createdAt).toLocaleDateString(),
        iconColor: 'text-purple-600 bg-purple-50 border-purple-100'
      });
    });
    enrollments.slice(0, 3 - activities.length).forEach(enr => {
      activities.push({
        id: `enr_${enr._id}`,
        text: `Enrolled in ${enr.course?.title || 'a course'}`,
        time: new Date(enr.createdAt || Date.now()).toLocaleDateString(),
        iconColor: 'text-blue-600 bg-blue-50 border-blue-100'
      });
    });
    console.log('activities:', activities);

    console.log('ALL SIMULATION SUCCESSFUL!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('CRITICAL ERROR:', err);
    mongoose.disconnect();
  });
