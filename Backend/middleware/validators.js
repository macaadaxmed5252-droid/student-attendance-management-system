import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

export const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const checkMongoId = (paramName) => [
  param(paramName).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid global resource identifier format: ${paramName}`);
    }
    return true;
  }),
  validateResult
];

export const authRegisterValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is strictly required'),
  body('email').trim().isEmail().withMessage('Please supply a valid email addresses')
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('Email address already registered within database');
    }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters in length'),
  body('role').optional().isIn(['admin', 'teacher', 'student']).withMessage('Invalid system role configuration'),
  validateResult
];

export const authLoginValidator = [
  body('email').trim().isEmail().withMessage('Please supply a valid email addresses'),
  body('password').notEmpty().withMessage('Password must not be empty'),
  validateResult
];

export const studentValidator = [
  body('studentId').trim().notEmpty().withMessage('Student System identification key required')
    .custom(async (studentId, { req }) => {
      const existingId = await Student.findOne({ studentId });
      if (existingId && req.method === 'POST') throw new Error('Student System ID key already exists');
    }),
  body('fullName').trim().notEmpty().withMessage('Full name parameter required'),
  body('className').trim().notEmpty().withMessage('Target class allocation required'),
  body('email').trim().isEmail().withMessage('Please supply a valid student email target')
    .custom(async (email, { req }) => {
      const existingEmail = await Student.findOne({ email });
      if (existingEmail && req.method === 'POST') throw new Error('Student email allocation entry already exists');
    }),
  body('phone').trim().notEmpty().withMessage('Active contact telephone digits required'),
  validateResult
];

export const teacherValidator = [
  body('teacherId').trim().notEmpty().withMessage('Teacher verification element required')
    .custom(async (teacherId, { req }) => {
      const existingId = await Teacher.findOne({ teacherId });
      if (existingId && req.method === 'POST') throw new Error('Teacher System ID token already exists');
    }),
  body('fullName').trim().notEmpty().withMessage('Full structural name parameter required'),
  body('academicSpecialty').trim().notEmpty().withMessage('Academic specialty discipline parameter required'),
  body('email').trim().isEmail().withMessage('Please supply a valid educator email target')
    .custom(async (email, { req }) => {
      const existingEmail = await Teacher.findOne({ email });
      if (existingEmail && req.method === 'POST') throw new Error('Teacher structural email allocation already registered');
    }),
  body('phone').trim().notEmpty().withMessage('Primary contact telephone digits required'),
  validateResult
];

export const attendanceValidator = [
  body('student').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) throw new Error('Target referenced Student ID format invalid');
    return true;
  }),
  body('date').notEmpty().withMessage('Target documentation calendar date parameter required')
    .isISO8601().withMessage('Target schedule tracking timestamp must comply with standard ISO 8601 formatting models'),
  body('status').isIn(['Present', 'Absent', 'Excused', 'Late']).withMessage('Target tracking validation entry states must match exactly Present, Absent or Excused'),
  validateResult
];
