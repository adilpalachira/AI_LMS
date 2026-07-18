require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error.middleware');

// Initialize express app
const app = express();

// Database Connection
connectDB();

// Global Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Allow Vite client
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Serve uploaded profile images statically
// Path resolves to /uploads/... (e.g. http://localhost:5000/uploads/profile/filename.png)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the AI-Powered LMS API',
    version: '1.0.0',
    status: 'Running'
  });
});

// Health-check endpoint to verify Mongoose state and database connection
const mongoose = require('mongoose');
app.get('/api/health', async (req, res) => {
  const readyState = mongoose.connection.readyState;
  let dbStatus = 'Disconnected';
  if (readyState === 1) dbStatus = 'Connected';
  else if (readyState === 2) dbStatus = 'Connecting';
  else if (readyState === 3) dbStatus = 'Disconnecting';

  let collectionsAccessible = false;
  try {
    if (readyState === 1) {
      // Access users collection and query counts to test connection read status
      await mongoose.connection.db.collection('users').estimatedDocumentCount();
      collectionsAccessible = true;
    }
  } catch (err) {
    console.error('[Healthcheck Error] Database read check failed:', err.message);
  }

  const isHealthy = readyState === 1 && collectionsAccessible;
  res.status(isHealthy ? 200 : 500).json({
    status: isHealthy ? 'Healthy' : 'Unhealthy',
    timestamp: new Date(),
    database: {
      status: dbStatus,
      readyState,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      collections: {
        users: collectionsAccessible ? 'accessible' : 'inaccessible'
      }
    }
  });
});

// Register Routers
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/sections', require('./routes/section.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/materials', require('./routes/material.routes'));
app.use('/api/assignments', require('./routes/assignment.routes'));
app.use('/api/submissions', require('./routes/submission.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/questions', require('./routes/question.routes'));
app.use('/api/ai/tutor', require('./routes/aiTutor.routes'));
app.use('/api/ai/knowledge-documents', require('./routes/knowledgeDocument.routes'));

// Centralized Error Handler Middleware
app.use(errorHandler);

// Server Listening
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[Server] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[Fatal Error] Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
