require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Course = require('../models/course.model');
const { hashPassword } = require('../services/password.service');

const seedUsers = [
  {
    name: 'System Administrator',
    email: 'admin@lms.com',
    password: 'AdminPassword123!',
    role: 'Admin',
    status: 'Active',
    isVerified: true
  },
  {
    name: 'Prof. Sarah Jenkins',
    email: 'faculty@lms.com',
    password: 'FacultyPassword123!',
    role: 'Faculty',
    status: 'Active',
    isVerified: true
  },
  {
    name: 'Alex Johnson',
    email: 'student@lms.com',
    password: 'StudentPassword123!',
    role: 'Student',
    status: 'Active',
    isVerified: true
  }
];

const seedCategories = [
  {
    name: 'Artificial Intelligence',
    description: 'Machine Learning, Deep Learning, Neural Networks, and NLP',
    icon: 'Brain'
  },
  {
    name: 'Computer Science',
    description: 'Data Structures, Algorithms, System Design, and Theory',
    icon: 'Code'
  },
  {
    name: 'Web Development',
    description: 'Full-stack MERN, React, Node.js, and Modern Web Tech',
    icon: 'Globe'
  },
  {
    name: 'Data Science',
    description: 'Python, Data Analytics, Visualization, and Predictive Modeling',
    icon: 'BarChart'
  }
];

const seedCoursesData = (adminId, facultyId, categoryMap) => [
  {
    title: 'Fundamentals of Artificial Intelligence & Machine Learning',
    code: 'CS-AI101',
    shortDescription: 'Master the core algorithms of Machine Learning, Neural Networks, and AI model evaluation.',
    fullDescription: 'This course introduces the fundamental concepts of Artificial Intelligence, Supervised & Unsupervised Learning, Decision Trees, Logistic Regression, Neural Networks, and Model Optimization using Python and Scikit-learn.',
    category: categoryMap['Artificial Intelligence'],
    level: 'Beginner',
    duration: '8 Weeks',
    language: 'English',
    instructor: facultyId,
    status: 'Published',
    tags: ['AI', 'Python', 'Machine Learning', 'Scikit-learn'],
    learningOutcomes: [
      'Understand core AI concepts and algorithms',
      'Train supervised classification and regression models',
      'Evaluate model performance metrics',
      'Apply AI solutions to real-world datasets'
    ],
    prerequisites: ['Basic Python programming knowledge'],
    createdBy: adminId
  },
  {
    title: 'Full-Stack MERN Architecture & Application Design',
    code: 'CS-WEB201',
    shortDescription: 'Build modern, responsive web applications with React, Node.js, Express, and MongoDB.',
    fullDescription: 'Comprehensive deep dive into building enterprise-grade MERN applications. Topics include RESTful API design, JWT authentication, state management, Tailwind CSS styling, and MongoDB indexing.',
    category: categoryMap['Web Development'],
    level: 'Intermediate',
    duration: '10 Weeks',
    language: 'English',
    instructor: facultyId,
    status: 'Published',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind'],
    learningOutcomes: [
      'Architect full-stack MERN web applications',
      'Implement JWT authentication and security controls',
      'Design RESTful API endpoints and Mongoose schemas',
      'Deploy full-stack web applications'
    ],
    prerequisites: ['HTML, CSS, and JavaScript fundamentals'],
    createdBy: adminId
  },
  {
    title: 'Data Structures & Algorithms in Practice',
    code: 'CS-DS301',
    shortDescription: 'Solve complex computational problems with optimized data structures and algorithmic paradigms.',
    fullDescription: 'Master Arrays, Linked Lists, Trees, Graphs, Hash Tables, Dynamic Programming, and Greedy Algorithms to excel in software engineering and technical interviews.',
    category: categoryMap['Computer Science'],
    level: 'Advanced',
    duration: '12 Weeks',
    language: 'English',
    instructor: adminId,
    status: 'Published',
    tags: ['Algorithms', 'Data Structures', 'Problem Solving', 'CS'],
    learningOutcomes: [
      'Analyze space and time complexities using Big-O notation',
      'Implement custom data structures from scratch',
      'Apply dynamic programming to optimization problems',
      'Solve graph traversal and pathfinding challenges'
    ],
    prerequisites: ['Programming proficiency in C++, Java, or Python'],
    createdBy: adminId
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-lms';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB:', mongoUri);

    // 1. Seed Users
    const userMap = {};
    for (const userData of seedUsers) {
      let user = await User.findOne({ email: userData.email.toLowerCase() });
      const hashedPassword = await hashPassword(userData.password);

      if (user) {
        user.name = userData.name;
        user.password = hashedPassword;
        user.role = userData.role;
        user.status = userData.status;
        user.isVerified = userData.isVerified;
        await user.save();
      } else {
        user = await User.create({
          ...userData,
          email: userData.email.toLowerCase(),
          password: hashedPassword
        });
      }
      userMap[user.role] = user._id;
      console.log(`[Seed] User ready (${user.role}): ${user.email}`);
    }

    // 2. Seed Categories
    const categoryMap = {};
    for (const catData of seedCategories) {
      let category = await Category.findOne({ name: catData.name });
      if (!category) {
        category = await Category.create({
          ...catData,
          createdBy: userMap['Admin']
        });
      }
      categoryMap[category.name] = category._id;
      console.log(`[Seed] Category ready: ${category.name}`);
    }

    // 3. Seed Courses
    const coursesToSeed = seedCoursesData(userMap['Admin'], userMap['Faculty'], categoryMap);
    for (const courseData of coursesToSeed) {
      const existing = await Course.findOne({ code: courseData.code });
      if (!existing) {
        await Course.create(courseData);
        console.log(`[Seed] Created Course: ${courseData.code} - ${courseData.title}`);
      }
    }

    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error.message);
    process.exit(1);
  }
};

seedDB();
