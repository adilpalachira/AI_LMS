const Course = require('../models/course.model');
const CourseSection = require('../models/section.model');
const Lesson = require('../models/lesson.model');
const LearningMaterial = require('../models/material.model');
const Quiz = require('../models/quiz.model');
const Assignment = require('../models/assignment.model');
const Enrollment = require('../models/enrollment.model');
const StudyPlanTask = require('../models/studyPlanTask.model');
const vectorStoreService = require('./rag/vectorStore.service');
const embeddingService = require('./ai/embedding.service');

/**
 * Topic Resolver Service
 * Deep-links study planner tasks and topics directly to course content (PDF page, Video timestamp, Text lesson note, Quiz, Assignment)
 * Reuses existing Module 6 RAG / vectorStore and document metadata without fabricating fake locations.
 */

/**
 * Check if student is authorized to access course content
 */
const verifyCourseAuthorization = async (courseId, studentId, userRole) => {
  if (['Admin', 'Faculty', 'Instructor'].includes(userRole)) {
    return true;
  }
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  if (!enrollment) {
    const error = new Error('Access denied: You are not enrolled in this course.');
    error.statusCode = 403;
    throw error;
  }
  return true;
};

/**
 * Resolve learning topic to exact location in course content
 * @param {Object} params { courseId, topic, title, resourceType, studentId, userRole }
 */
const resolveTopicToContent = async ({
  courseId,
  topic = '',
  title = '',
  resourceType = 'General',
  studentId,
  userRole = 'Student'
}) => {
  if (!courseId) {
    return {
      found: false,
      message: 'Course ID is required to resolve topic content.'
    };
  }

  // 1. Verify access authorization
  if (studentId) {
    await verifyCourseAuthorization(courseId, studentId, userRole);
  }

  const queryTopic = (topic || title || '').trim();
  const queryTopicLower = queryTopic.toLowerCase();

  // 2. Fetch course hierarchy
  const [course, sections, lessons, materials, quizzes, assignments] = await Promise.all([
    Course.findById(courseId).lean(),
    CourseSection.find({ courseId }).sort({ order: 1 }).lean(),
    Lesson.find({ courseId }).sort({ order: 1 }).lean(),
    LearningMaterial.find({ courseId }).lean(),
    Quiz.find({ courseId, status: 'Published' }).lean(),
    Assignment.find({ courseId }).lean()
  ]);

  if (!course) {
    return {
      found: false,
      message: 'Target course not found.'
    };
  }

  // Helper map for fast lesson -> section lookup
  const lessonToSectionMap = new Map();
  sections.forEach(sec => {
    (sec.lessons || []).forEach(lId => {
      lessonToSectionMap.set(lId.toString(), sec);
    });
  });

  // 3. If resourceType is Quiz or Assignment, match directly
  if (resourceType === 'Quiz' || queryTopicLower.includes('quiz') || queryTopicLower.includes('test')) {
    const matchedQuiz = quizzes.find(q => {
      const qTitle = (q.title || '').toLowerCase();
      return queryTopicLower.includes(qTitle) || qTitle.includes(queryTopicLower);
    }) || quizzes[0];

    if (matchedQuiz) {
      return {
        found: true,
        type: 'Quiz',
        courseId: courseId.toString(),
        quizId: matchedQuiz._id.toString(),
        sourceTitle: `Quiz: ${matchedQuiz.title}`,
        directUrl: `/quizzes/${matchedQuiz._id}/take`
      };
    }
  }

  if (resourceType === 'Assignment' || queryTopicLower.includes('assignment') || queryTopicLower.includes('project')) {
    const matchedAssign = assignments.find(a => {
      const aTitle = (a.title || '').toLowerCase();
      return queryTopicLower.includes(aTitle) || aTitle.includes(queryTopicLower);
    }) || assignments[0];

    if (matchedAssign) {
      return {
        found: true,
        type: 'Assignment',
        courseId: courseId.toString(),
        assignmentId: matchedAssign._id.toString(),
        sourceTitle: `Assignment: ${matchedAssign.title}`,
        directUrl: `/courses/${courseId}/student-assignments`
      };
    }
  }

  // 4. Module 6 RAG / Vector Store Similarity Search for exact PDF page or content chunk
  let ragMatch = null;
  try {
    let queryVector = [];
    try {
      queryVector = await embeddingService.generateEmbedding(queryTopic);
    } catch (e) {
      // Vector generation fallback
    }

    const matchedChunks = await vectorStoreService.similaritySearch(queryVector, courseId.toString(), 5, queryTopic);

    if (Array.isArray(matchedChunks) && matchedChunks.length > 0) {
      // Find top chunk with valid material/lesson metadata
      for (const chunk of matchedChunks) {
        const meta = chunk.metadata || {};
        if (meta.materialId || meta.lessonId) {
          const mat = materials.find(m => m._id.toString() === (meta.materialId || '').toString());
          const les = lessons.find(l => l._id.toString() === (meta.lessonId || (mat ? mat.lessonId?.toString() : '')).toString());

          if (mat || les) {
            ragMatch = {
              chunk,
              material: mat,
              lesson: les,
              pageNumber: typeof meta.pageNumber === 'number' && meta.pageNumber > 0 ? meta.pageNumber : null,
              textSnippet: meta.text ? meta.text.slice(0, 200) : ''
            };
            break;
          }
        }
      }
    }
  } catch (ragErr) {
    console.warn('[TopicResolver] RAG search notice:', ragErr.message);
  }

  // 5. Build Deep Link from RAG match if found
  if (ragMatch && (ragMatch.material || ragMatch.lesson)) {
    const matchedLesson = ragMatch.lesson || (ragMatch.material ? lessons.find(l => l._id.toString() === ragMatch.material.lessonId?.toString()) : null);
    const lessonId = matchedLesson ? matchedLesson._id.toString() : '';
    const section = matchedLesson ? lessonToSectionMap.get(lessonId) : null;
    const material = ragMatch.material;

    // PDF Deep link with verified exact page
    if (material && (material.fileType === 'pdf' || material.mimeType?.includes('pdf') || material.fileName?.toLowerCase().endsWith('.pdf'))) {
      const pageParam = ragMatch.pageNumber ? `&page=${ragMatch.pageNumber}` : '';
      return {
        found: true,
        type: 'PDF',
        courseId: courseId.toString(),
        sectionId: section?._id?.toString() || '',
        sectionTitle: section?.title || '',
        lessonId,
        lessonTitle: matchedLesson?.title || '',
        materialId: material._id.toString(),
        materialName: material.fileName,
        page: ragMatch.pageNumber, // EXACT page from document metadata or null
        textSnippet: ragMatch.textSnippet,
        topic: queryTopic,
        sourceTitle: `${matchedLesson?.title || 'Lesson'} • ${material.fileName}${ragMatch.pageNumber ? ` (Page ${ragMatch.pageNumber})` : ''}`,
        directUrl: `/courses/${courseId}/lessons/${lessonId}?materialId=${material._id}${pageParam}&topic=${encodeURIComponent(queryTopic)}`
      };
    }

    // Video Deep link with verified timestamp if available in aiMetadata
    if (material && (material.fileType === 'video' || material.mimeType?.includes('video'))) {
      const startTime = material.aiMetadata?.timestamps?.[queryTopicLower] || material.aiMetadata?.startSecond || null;
      const startParam = startTime ? `&start=${startTime}` : '';
      return {
        found: true,
        type: 'Video',
        courseId: courseId.toString(),
        sectionId: section?._id?.toString() || '',
        sectionTitle: section?.title || '',
        lessonId,
        lessonTitle: matchedLesson?.title || '',
        materialId: material._id.toString(),
        materialName: material.fileName,
        startTime,
        topic: queryTopic,
        sourceTitle: `${matchedLesson?.title || 'Lesson'} • ${material.fileName}${startTime ? ` (${Math.floor(startTime / 60)}:${String(startTime % 60).padStart(2, '0')})` : ''}`,
        directUrl: `/courses/${courseId}/lessons/${lessonId}?materialId=${material._id}${startParam}&topic=${encodeURIComponent(queryTopic)}`
      };
    }

    // Text Lesson / Note Deep link
    if (matchedLesson) {
      return {
        found: true,
        type: matchedLesson.contentType === 'Text Note' ? 'Text Note' : (matchedLesson.contentType || 'Lesson'),
        courseId: courseId.toString(),
        sectionId: section?._id?.toString() || '',
        sectionTitle: section?.title || '',
        lessonId,
        lessonTitle: matchedLesson.title,
        textSnippet: ragMatch.textSnippet || matchedLesson.description || '',
        topic: queryTopic,
        sourceTitle: `${matchedLesson.title}`,
        directUrl: `/courses/${courseId}/lessons/${lessonId}?topic=${encodeURIComponent(queryTopic)}`
      };
    }
  }

  // 6. Direct Lesson Curriculum & Material Text Search (Semantic & Title Matching)
  let matchedLesson = null;
  let matchedMaterial = null;

  // Search by lesson title / description / textNote
  for (const les of lessons) {
    const lTitle = (les.title || '').toLowerCase();
    const lDesc = (les.description || '').toLowerCase();
    const lNote = (les.textNote || '').toLowerCase();

    if (queryTopicLower.includes(lTitle) || lTitle.includes(queryTopicLower) ||
        lDesc.includes(queryTopicLower) || lNote.includes(queryTopicLower)) {
      matchedLesson = les;
      break;
    }
  }

  // Search materials attached to lessons
  if (!matchedLesson) {
    for (const mat of materials) {
      const fName = (mat.fileName || '').toLowerCase();
      const extText = (mat.extractedText || '').toLowerCase();

      if (queryTopicLower.includes(fName) || fName.includes(queryTopicLower) || extText.includes(queryTopicLower)) {
        matchedMaterial = mat;
        matchedLesson = lessons.find(l => l._id.toString() === mat.lessonId?.toString());
        break;
      }
    }
  }

  // 7. Resolve Found Lesson or Material
  if (matchedLesson) {
    const lessonId = matchedLesson._id.toString();
    const section = lessonToSectionMap.get(lessonId);
    const lessonMaterials = materials.filter(m => m.lessonId?.toString() === lessonId);
    const pdfMat = lessonMaterials.find(m => m.fileType === 'pdf' || m.mimeType?.includes('pdf') || m.fileName?.toLowerCase().endsWith('.pdf'));
    const videoMat = lessonMaterials.find(m => m.fileType === 'video' || m.mimeType?.includes('video'));

    if (matchedLesson.contentType === 'PDF' || pdfMat) {
      const targetMat = pdfMat || matchedMaterial || lessonMaterials[0];
      return {
        found: true,
        type: 'PDF',
        courseId: courseId.toString(),
        sectionId: section?._id?.toString() || '',
        sectionTitle: section?.title || '',
        lessonId,
        lessonTitle: matchedLesson.title,
        materialId: targetMat?._id?.toString() || '',
        materialName: targetMat?.fileName || 'PDF Document',
        page: null, // No fake page number when not explicitly known from chunk
        topic: queryTopic,
        sourceTitle: `${matchedLesson.title} • ${targetMat?.fileName || 'PDF Document'}`,
        directUrl: `/courses/${courseId}/lessons/${lessonId}${targetMat ? `?materialId=${targetMat._id}&topic=${encodeURIComponent(queryTopic)}` : `?topic=${encodeURIComponent(queryTopic)}`}`
      };
    }

    if (matchedLesson.contentType === 'Video' || matchedLesson.contentType === 'YouTube' || videoMat) {
      const targetMat = videoMat || lessonMaterials[0];
      return {
        found: true,
        type: matchedLesson.contentType === 'YouTube' ? 'YouTube' : 'Video',
        courseId: courseId.toString(),
        sectionId: section?._id?.toString() || '',
        sectionTitle: section?.title || '',
        lessonId,
        lessonTitle: matchedLesson.title,
        materialId: targetMat?._id?.toString() || '',
        materialName: targetMat?.fileName || 'Video Lesson',
        startTime: null, // No fake timestamp
        topic: queryTopic,
        sourceTitle: `${matchedLesson.title}`,
        directUrl: `/courses/${courseId}/lessons/${lessonId}?topic=${encodeURIComponent(queryTopic)}`
      };
    }

    return {
      found: true,
      type: matchedLesson.contentType || 'Lesson',
      courseId: courseId.toString(),
      sectionId: section?._id?.toString() || '',
      sectionTitle: section?.title || '',
      lessonId,
      lessonTitle: matchedLesson.title,
      textSnippet: matchedLesson.description || matchedLesson.textNote?.slice(0, 150) || '',
      topic: queryTopic,
      sourceTitle: `${matchedLesson.title}`,
      directUrl: `/courses/${courseId}/lessons/${lessonId}?topic=${encodeURIComponent(queryTopic)}`
    };
  }

  // 8. Graceful Fallback if course has any lessons
  if (lessons.length > 0) {
    const firstLesson = lessons[0];
    const section = lessonToSectionMap.get(firstLesson._id.toString());
    return {
      found: true,
      fallback: true,
      type: firstLesson.contentType || 'Lesson',
      courseId: courseId.toString(),
      sectionId: section?._id?.toString() || '',
      sectionTitle: section?.title || '',
      lessonId: firstLesson._id.toString(),
      lessonTitle: firstLesson.title,
      topic: queryTopic,
      sourceTitle: `Course Material • ${firstLesson.title}`,
      directUrl: `/courses/${courseId}/lessons/${firstLesson._id.toString()}?topic=${encodeURIComponent(queryTopic)}`
    };
  }

  // 9. No matching material in course
  return {
    found: false,
    message: 'Learning material for this topic could not be located.'
  };
};

/**
 * Resolve content deep-link for an existing StudyPlanTask
 * @param {string} taskId 
 * @param {string} studentId 
 * @param {string} userRole 
 */
const resolveTaskLocation = async (taskId, studentId, userRole = 'Student') => {
  const task = await StudyPlanTask.findById(taskId).populate('studyPlanId');
  if (!task) {
    const error = new Error('Study task not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify task ownership or staff access
  if (userRole === 'Student' && task.studyPlanId.studentId.toString() !== studentId.toString()) {
    const error = new Error('Unauthorized task access');
    error.statusCode = 403;
    throw error;
  }

  const courseId = task.courseId || task.studyPlanId.courseId;

  const resolution = await resolveTopicToContent({
    courseId,
    topic: task.topic || task.title,
    title: task.title,
    resourceType: task.resourceType,
    studentId,
    userRole
  });

  // If newly resolved, save back to task for caching
  if (resolution.found) {
    task.courseId = courseId;
    if (resolution.lessonId) task.lessonId = resolution.lessonId;
    if (resolution.sectionId) task.sectionId = resolution.sectionId;
    if (resolution.materialId) task.materialId = resolution.materialId;
    task.targetLocation = {
      contentType: resolution.type,
      page: resolution.page || null,
      startTime: resolution.startTime || null,
      sourceTitle: resolution.sourceTitle || '',
      directUrl: resolution.directUrl || '',
      textSnippet: resolution.textSnippet || ''
    };
    await task.save();
  }

  return {
    taskId: task._id,
    taskTitle: task.title,
    topic: task.topic,
    status: task.status,
    resolution
  };
};

module.exports = {
  resolveTopicToContent,
  resolveTaskLocation,
  verifyCourseAuthorization
};
