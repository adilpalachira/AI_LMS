const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: Unique auto-generated Mongo identifier
 *         name:
 *           type: string
 *           description: User full name
 *         email:
 *           type: string
 *           description: Unique email address
 *         role:
 *           type: string
 *           enum: [Admin, Faculty, Student]
 *           description: User access permission role
 *         phone:
 *           type: string
 *           description: User contact phone number
 *         profileImage:
 *           type: string
 *           description: Path/URL to the uploaded profile photo
 *         status:
 *           type: string
 *           enum: [Active, Inactive]
 *           description: User account activation status
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ['Admin', 'Faculty', 'Student'],
      default: 'Student',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    lastLogin: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
